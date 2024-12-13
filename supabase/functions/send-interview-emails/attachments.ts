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
      .filter(candidate => candidate.file_path)
      .map(async (candidate) => {
        try {
          console.log('Processing attachment for candidate:', candidate.name);
          
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('cvs')
            .createSignedUrl(candidate.file_path!, 60);

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

          const fileArrayBuffer = await fileResponse.arrayBuffer();
          const uint8Array = new Uint8Array(fileArrayBuffer);
          const base64String = btoa(String.fromCharCode.apply(null, uint8Array));

          console.log('Successfully processed file:', candidate.file_name);

          return {
            filename: candidate.file_name,
            content: base64String,
          };
        } catch (error) {
          console.error('Error processing attachment:', error);
          return null;
        }
      })
  );

  return attachments.filter(Boolean);
};