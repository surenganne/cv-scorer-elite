import JSZip from 'jszip';
import { FileWithPreview } from '@/types/file';
import { isValidFileType } from './fileUtils';

export const extractFilesFromZip = async (zipFile: File): Promise<FileWithPreview[]> => {
  const zip = new JSZip();
  const extractedFiles: FileWithPreview[] = [];
  
  try {
    const zipContent = await zip.loadAsync(zipFile);
    
    const validEntries = Object.entries(zipContent.files).filter(([relativePath, zipEntry]) => {
      const fileName = relativePath.split('/').pop() || relativePath;
      return !zipEntry.dir && 
             isValidFileType(relativePath) &&
             !fileName.startsWith('._') && 
             !fileName.includes('.DS_Store') &&
             !fileName.includes('__MACOSX');
    });
    
    for (const [relativePath, zipEntry] of validEntries) {
      const fileName = relativePath.split('/').pop() || relativePath;
      const content = await zipEntry.async('blob');
      
      const fileType = fileName.split('.').pop()?.toLowerCase() || '';
      const mimeType = fileType === 'pdf' ? 'application/pdf' :
                      ['doc', 'docx'].includes(fileType) ? 'application/msword' :
                      'application/octet-stream';

      const file = new File([content], fileName, {
        type: mimeType,
        lastModified: zipEntry.date.getTime(),
      });

      const extractedFile: FileWithPreview = {
        file,
        preview: URL.createObjectURL(content),
        progress: 0,
        processed: false,
        webkitRelativePath: relativePath
      };
      
      console.log(`Extracted file: ${fileName}, size: ${file.size} bytes`);
      extractedFiles.push(extractedFile);
    }
    
    console.log(`Total valid files extracted: ${extractedFiles.length}`);
    return extractedFiles;
  } catch (error) {
    console.error('Error extracting ZIP:', error);
    throw error;
  }
};