import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Candidate } from './emailTemplate.ts';

export const processAttachments = async (candidates: Candidate[]) => {
  console.log('Processing attachments for candidates:', candidates.length);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const attachments = await Promise.all(
    candidates
      .filter(candidate => {
        if (!candidate.file_path) {
          console.warn('Skipping candidate without file_path:', candidate.name);
          return false;
        }
        return true;
      })
      .map(async (candidate) => {
        try {
          console.log('Processing attachment for candidate:', candidate.name, 'with file path:', candidate.file_path);
          
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('cvs')
            .createSignedUrl(candidate.file_path!, 3600); // 1 hour expiry

          if (signedUrlError) {
            console.error('Error getting signed URL:', signedUrlError);
            return null;
          }

          console.log('Got signed URL:', signedUrlData.signedUrl);

          const fileResponse = await fetch(signedUrlData.signedUrl);
          if (!fileResponse.ok) {
            console.error('Error downloading file:', fileResponse.statusText);
            return null;
          }

          const fileBuffer = await fileResponse.arrayBuffer();
          const uint8Array = new Uint8Array(fileBuffer);
          const base64String = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

          console.log('Successfully processed file:', candidate.file_name, 'Size:', fileBuffer.byteLength, 'bytes');

          return {
            filename: candidate.file_name,
            content: base64String,
            type: 'application/octet-stream',
            disposition: 'attachment'
          };
        } catch (error) {
          console.error('Error processing attachment for', candidate.name, ':', error);
          return null;
        }
      })
  );

  // Filter out any null results from failed attachment processing
  const validAttachments = attachments.filter(Boolean);
  console.log(`Successfully processed ${validAttachments.length} attachments out of ${candidates.length} candidates`);
  
  if (validAttachments.length < candidates.length) {
    console.warn('Some attachments failed to process:', {
      processed: validAttachments.length,
      total: candidates.length
    });
  }
  
  return validAttachments;
};