import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Candidate } from './emailTemplate.ts';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 60000; // 1 minute timeout
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok && retries > 0) {
      console.log(`Retrying fetch for URL (${retries} attempts remaining)`);
      return fetchWithRetry(url, retries - 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Fetch failed, retrying (${retries} attempts remaining):`, error);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

async function processAttachment(candidate: Candidate, supabase: any) {
  try {
    console.log(`Processing attachment for ${candidate.name}`);
    
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('cvs')
      .createSignedUrl(candidate.file_path!, 1800); // 30 minutes expiry
    
    if (signedUrlError) {
      console.error(`Error getting signed URL for ${candidate.name}:`, signedUrlError);
      return null;
    }

    if (!signedUrlData?.signedUrl) {
      console.error(`No signed URL returned for ${candidate.name}`);
      return null;
    }

    const fileResponse = await fetchWithRetry(signedUrlData.signedUrl);
    
    if (!fileResponse.ok) {
      console.error(`Error downloading file for ${candidate.name}:`, fileResponse.statusText);
      return null;
    }

    const contentType = fileResponse.headers.get('content-type');
    if (!contentType) {
      console.error(`No content type in response for ${candidate.name}`);
      return null;
    }

    // Stream the file in chunks
    const reader = fileResponse.body?.getReader();
    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    if (!reader) {
      console.error(`No reader available for ${candidate.name}`);
      return null;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      totalSize += value.length;
      
      if (totalSize > 10 * 1024 * 1024) { // 10MB limit
        console.error(`File too large for ${candidate.name}`);
        return null;
      }
    }

    // Combine chunks
    const fullBuffer = new Uint8Array(totalSize);
    let position = 0;
    for (const chunk of chunks) {
      fullBuffer.set(chunk, position);
      position += chunk.length;
    }

    const base64String = btoa(String.fromCharCode.apply(null, Array.from(fullBuffer)));
    
    console.log(`Successfully processed ${candidate.name}, size: ${totalSize} bytes`);
    
    return {
      filename: candidate.file_name,
      content: base64String,
      type: contentType,
    };
  } catch (error) {
    console.error(`Error processing attachment for ${candidate.name}:`, error);
    return null;
  }
}

export const processAttachments = async (candidates: Candidate[]) => {
  console.log('Processing attachments for candidates:', candidates.length);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Process attachments sequentially to avoid memory issues
  const attachments = [];
  for (const candidate of candidates) {
    if (candidate.file_path) {
      const attachment = await processAttachment(candidate, supabase);
      if (attachment) {
        attachments.push(attachment);
      }
    }
  }

  console.log(`Successfully processed ${attachments.length} out of ${candidates.length} attachments`);
  
  // Only proceed if all attachments were processed
  if (attachments.length !== candidates.filter(c => c.file_path).length) {
    throw new Error(`Failed to process all attachments. Only ${attachments.length} out of ${candidates.length} were successful.`);
  }
  
  return attachments;
};