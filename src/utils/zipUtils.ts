import JSZip from 'jszip';
import { FileWithPreview } from '@/types/file';
import { isValidFileType } from './fileUtils';

export const extractFilesFromZip = async (zipFile: File): Promise<FileWithPreview[]> => {
  const zip = new JSZip();
  const extractedFiles: FileWithPreview[] = [];
  
  try {
    const zipContent = await zip.loadAsync(zipFile);
    
    // Filter out system files first
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

      // Create a new object that inherits from File but includes our custom properties
      const extractedFile = Object.create(file, {
        preview: {
          value: URL.createObjectURL(content),
          writable: true,
          enumerable: true,
          configurable: true
        },
        progress: {
          value: 0,
          writable: true,
          enumerable: true,
          configurable: true
        },
        processed: {
          value: false,
          writable: true,
          enumerable: true,
          configurable: true
        },
        score: {
          value: 0,
          writable: true,
          enumerable: true,
          configurable: true
        },
        matchPercentage: {
          value: 0,
          writable: true,
          enumerable: true,
          configurable: true
        },
        // Bind File methods to ensure correct 'this' context
        slice: {
          value: file.slice.bind(file),
          writable: true,
          enumerable: true,
          configurable: true
        },
        stream: {
          value: file.stream.bind(file),
          writable: true,
          enumerable: true,
          configurable: true
        },
        text: {
          value: file.text.bind(file),
          writable: true,
          enumerable: true,
          configurable: true
        },
        arrayBuffer: {
          value: file.arrayBuffer.bind(file),
          writable: true,
          enumerable: true,
          configurable: true
        }
      }) as FileWithPreview;
      
      console.log(`Extracted file: ${fileName}, size: ${extractedFile.size} bytes`);
      extractedFiles.push(extractedFile);
    }
    
    console.log(`Total valid files extracted: ${extractedFiles.length}`);
    return extractedFiles;
  } catch (error) {
    console.error('Error extracting ZIP:', error);
    throw error;
  }
};