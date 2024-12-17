import { Candidate, ProcessedAttachment, FailedAttachment } from './types.ts';
import { retry } from './retryUtils.ts';
import { processFile, verifyFileExists, getSignedUrl, downloadFile } from './fileUtils.ts';

export async function processAttachments(candidates: Candidate[]) {
  console.log('Starting attachment processing for', candidates.length, 'files');
  console.log('Candidates to process:', candidates.map(c => ({ name: c.name, path: c.file_path })));
  
  const processedAttachments: ProcessedAttachment[] = [];
  const failedAttachments: FailedAttachment[] = [];

  for (const candidate of candidates) {
    try {
      console.log('\nProcessing candidate:', {
        name: candidate.name,
        filePath: candidate.file_path,
        fileName: candidate.file_name
      });
      
      if (!candidate.file_path) {
        throw new Error(`Missing file path for ${candidate.name}`);
      }

      const fileExists = await verifyFileExists(candidate.file_path);
      if (!fileExists) {
        throw new Error(`File not found in storage: ${candidate.file_path}`);
      }

      // Get signed URL with retry
      const signedUrl = await retry(() => getSignedUrl(candidate.file_path));
      console.log('Successfully got signed URL for:', candidate.name);

      // Download file with retry
      const fileArrayBuffer = await retry(() => downloadFile(signedUrl));
      console.log('Successfully downloaded file:', {
        name: candidate.name,
        size: fileArrayBuffer.byteLength
      });

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
    failedCandidates: failedAttachments.map(f => ({ name: f.name, error: f.error }))
  });

  if (processedAttachments.length === 0) {
    throw new Error(`Failed to process any attachments. Errors: ${JSON.stringify(failedAttachments)}`);
  }

  return processedAttachments;
}