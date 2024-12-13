import { useState } from "react";
import { FileWithPreview } from "@/types/file";

export const useFileState = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileWithPreview[]>([]);

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    setProcessedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  return {
    files,
    setFiles,
    processedFiles,
    setProcessedFiles,
    removeFile,
  };
};