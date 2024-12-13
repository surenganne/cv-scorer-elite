import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Candidate } from './emailTemplate.ts';

export const processAttachments = async (candidates: Candidate[]) => {
  console.log('Processing attachments for candidates:', candidates.length);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const attachmentPromises = candidates
    .filter(candidate => candidate.file_path)
    .map(async (candidate) => {
      try {
        console.log('Processing attachment for candidate:', candidate.name, 'with file path:', candidate.file_path);
        
        // Get signed URL with longer expiration (5 minutes) to ensure download completes
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('cvs')
          .createSignedUrl(candidate.file_path!, 300);

        if (signedUrlError) {
          console.error('Error getting signed URL for', candidate.name, ':', signedUrlError);
          return null;
        }

        if (!signedUrlData?.signedUrl) {
          console.error('No signed URL returned for', candidate.name);
          return null;
        }

        console.log('Got signed URL for', candidate.name, ':', signedUrlData.signedUrl);

        const fileResponse = await fetch(signedUrlData.signedUrl);
        if (!fileResponse.ok) {
          console.error('Error downloading file for', candidate.name, ':', fileResponse.statusText);
          return null;
        }

        const contentType = fileResponse.headers.get('content-type');
        if (!contentType) {
          console.error('No content type in response for', candidate.name);
          return null;
        }

        const fileArrayBuffer = await fileResponse.arrayBuffer();
        if (fileArrayBuffer.byteLength === 0) {
          console.error('Empty file received for', candidate.name);
          return null;
        }

        const uint8Array = new Uint8Array(fileArrayBuffer);
        const base64String = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

        console.log('Successfully processed file:', candidate.name, 'Size:', fileArrayBuffer.byteLength, 'bytes');

        return {
          filename: candidate.file_name,
          content: base64String,
          type: contentType,
        };
      } catch (error) {
        console.error('Error processing attachment for', candidate.name, ':', error);
        return null;
      }
    });

  // Wait for all attachments to be processed
  const attachments = await Promise.all(attachmentPromises);

  // Filter out any null results from failed attachment processing
  const validAttachments = attachments.filter(Boolean);
  console.log(`Successfully processed ${validAttachments.length} out of ${candidates.length} attachments`);
  
  return validAttachments;
};