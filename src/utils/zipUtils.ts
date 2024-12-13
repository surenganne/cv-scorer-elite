import JSZip from 'jszip';
import { FileWithPreview } from '@/types/file';
import { isValidFileType } from './fileUtils';

export const extractFilesFromZip = async (zipFile: File): Promise<FileWithPreview[]> => {
  const zip = new JSZip();
  const extractedFiles: FileWithPreview[] = [];
  
  try {
    const zipContent = await zip.loadAsync(zipFile);
    
    for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
      if (!zipEntry.dir && isValidFileType(relativePath)) {
        const fileName = relativePath.split('/').pop() || relativePath;
        const content = await zipEntry.async('blob');
        
        // Create a File object with the correct MIME type based on the file extension
        const fileType = fileName.split('.').pop() || '';
        const mimeType = fileType === 'pdf' ? 'application/pdf' :
                        fileType === 'doc' || fileType === 'docx' ? 'application/msword' :
                        fileType === 'txt' ? 'text/plain' :
                        fileType === 'rtf' ? 'application/rtf' :
                        'application/octet-stream';

        // Create a new File object with all properties set during construction
        const extractedFile = new File([content], fileName, {
          type: mimeType,
          lastModified: zipEntry.date.getTime(),
        }) as FileWithPreview;
        
        // Add preview URL
        extractedFile.preview = URL.createObjectURL(content);
        console.log(`Extracted file: ${fileName}, size: ${extractedFile.size} bytes`);
        
        extractedFiles.push(extractedFile);
      }
    }
    
    // Filter out macOS system files
    const filteredFiles = extractedFiles.filter(file => 
      !file.name.startsWith('._') && 
      !file.name.includes('.DS_Store') &&
      !file.name.includes('__MACOSX')
    );
    
    console.log(`Total valid files extracted: ${filteredFiles.length}`);
    return filteredFiles;
  } catch (error) {
    console.error('Error extracting ZIP:', error);
    throw error;
  }
};