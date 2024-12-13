import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface Candidate {
  name: string;
  file_path: string;
  file_name?: string;
}

// Retry function with exponential backoff
async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;
      
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

async function processFile(fileArrayBuffer: ArrayBuffer): Promise<string> {
  const chunkSize = 256 * 1024; // Process in 256KB chunks
  const chunks: string[] = [];
  
  for (let i = 0; i < fileArrayBuffer.byteLength; i += chunkSize) {
    const chunk = fileArrayBuffer.slice(i, Math.min(i + chunkSize, fileArrayBuffer.byteLength));
    const uint8Array = new Uint8Array(chunk);
    const binary = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
    chunks.push(btoa(binary));
  }
  
  return chunks.join('');
}

export async function processAttachments(candidates: Candidate[]) {
  console.log('Starting attachment processing for', candidates.length, 'files');
  console.log('Candidates to process:', candidates.map(c => ({ name: c.name, path: c.file_path })));
  
  const processedAttachments = [];
  const failedAttachments = [];

  // Process files sequentially
  for (const candidate of candidates) {
    try {
      console.log('\nProcessing candidate:', {
        name: candidate.name,
        filePath: candidate.file_path,
        fileName: candidate.file_name
      });
      
      // Validate file path
      if (!candidate.file_path) {
        throw new Error(`Missing file path for ${candidate.name}`);
      }

      // Ensure file path starts with 'cvs/' and get the storage path
      const storagePath = candidate.file_path.replace(/^cvs\//, '');
      console.log('Storage path after processing:', storagePath);

      // Get signed URL with retry
      const { signedUrl } = await retry(async () => {
        const { data, error } = await supabase.storage
          .from('cvs')
          .createSignedUrl(storagePath, 300);

        if (error) {
          throw new Error(`Failed to get signed URL: ${error.message}`);
        }
        if (!data?.signedUrl) {
          throw new Error('No signed URL received');
        }
        
        return data;
      });

      console.log('Successfully got signed URL for:', candidate.name);

      // Download file with retry
      const fileArrayBuffer = await retry(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        
        try {
          const response = await fetch(signedUrl, {
            signal: controller.signal
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return await response.arrayBuffer();
        } finally {
          clearTimeout(timeout);
        }
      });

      console.log('Successfully downloaded file:', {
        name: candidate.name,
        size: fileArrayBuffer.byteLength
      });

      // Process file in chunks
      const base64String = await processFile(fileArrayBuffer);

      console.log('Successfully processed file:', {
        name: candidate.name,
        fileName: candidate.file_name,
        fileSize: fileArrayBuffer.byteLength
      });

      processedAttachments.push({
        filename: candidate.file_name || `${candidate.name}.pdf`,
        content: base64String,
        type: 'application/pdf'
      });

      // Add a small delay between files
      if (candidates.indexOf(candidate) < candidates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Failed to process attachment:', {
        candidate: candidate.name,
        path: candidate.file_path,
        error: error.message,
        stack: (error as Error).stack
      });
      failedAttachments.push({
        name: candidate.name,
        path: candidate.file_path,
        error: error.message
      });
    }
  }

  console.log('\nAttachment processing summary:', {
    total: candidates.length,
    successful: processedAttachments.length,
    failed: failedAttachments.length,
    failedCandidates: failedAttachments.map(f => f.name)
  });

  if (processedAttachments.length === 0) {
    throw new Error(`Failed to process any attachments. Errors: ${JSON.stringify(failedAttachments)}`);
  }

  return processedAttachments;
}