import JSZip from 'jszip';
import { FileWithPreview } from '@/types/file';
import { isValidFileType } from './fileUtils';

export const extractFilesFromZip = async (zipFile: File): Promise<FileWithPreview[]> => {
  const zip = new JSZip();
  const extractedFiles: FileWithPreview[] = [];
  
  try {
    const zipContent = await zip.loadAsync(zipFile);
    
    // Process all files in ZIP (including those in folders)
    for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
      if (!zipEntry.dir) {
        console.log(`Processing ZIP entry: ${relativePath}`);
        
        if (isValidFileType(relativePath)) {
          const content = await zipEntry.async('blob');
          const fileName = relativePath.split('/').pop() || relativePath;
          
          // Create a new File object with the correct name and size
          const extractedFile = new File([content], fileName, {
            type: `application/${fileName.split('.').pop()}`,
            lastModified: zipEntry.date.getTime(),
          }) as FileWithPreview;
          
          // Add preview URL
          extractedFile.preview = URL.createObjectURL(content);
          console.log(`Extracted file: ${fileName}, size: ${content.size} bytes`);
          
          extractedFiles.push(extractedFile);
        }
      }
    }
    
    // Filter out macOS system files
    const filteredFiles = extractedFiles.filter(file => !file.name.startsWith('._') && !file.name.includes('.DS_Store'));
    console.log(`Total valid files extracted: ${filteredFiles.length}`);
    return filteredFiles;
  } catch (error) {
    console.error('Error extracting ZIP:', error);
    throw error;
  }
};