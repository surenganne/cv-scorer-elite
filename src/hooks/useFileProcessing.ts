import { FileWithPreview } from "@/types/file";
import { useFileState } from "./useFileState";
import { useFileProcessor } from "./useFileProcessor";
import { useFileUpload } from "./useFileUpload";

export const useFileProcessing = () => {
  const {
    files,
    setFiles,
    processedFiles,
    setProcessedFiles,
    removeFile,
  } = useFileState();
  
  const { processFile } = useFileProcessor();
  const { uploadToDatabase } = useFileUpload();

  const handleProcess = async (file: FileWithPreview) => {
    try {
      const updateProgress = (progress: number) => {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file.name === file.file.name ? { ...f, progress } : f
          )
        );
      };

      const newProcessedFiles = await processFile(file, updateProgress);
      
      // Update the original file as processed
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file.name === file.file.name ? { ...f, processed: true, progress: 100 } : f
        )
      );
      
      setProcessedFiles(prev => [...prev, ...newProcessedFiles]);
    } catch (error) {
      console.error('Processing failed:', error);
      // Reset progress on error
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file.name === file.file.name ? { ...f, progress: 0 } : f
        )
      );
    }
  };

  const handleUploadToDatabase = async () => {
    try {
      await uploadToDatabase(processedFiles);
      setFiles([]);
      setProcessedFiles([]);
    } catch (error) {
      console.error('Upload to database failed:', error);
    }
  };

  return {
    files,
    setFiles,
    processedFiles,
    removeFile,
    handleProcess,
    uploadToDatabase: handleUploadToDatabase
  };
};