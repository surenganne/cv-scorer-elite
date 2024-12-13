import { useState } from "react";
import { FileWithPreview } from "@/types/file";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileProcessing = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileWithPreview[]>([]);
  const { toast } = useToast();

  const processFile = async (file: FileWithPreview) => {
    try {
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: 0 } : f
        )
      );

      const progressInterval = setInterval(() => {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f === file && f.progress !== undefined && f.progress < 90
              ? { ...f, progress: f.progress + 5 }
              : f
          )
        );
      }, 300);

      console.log('Starting processing for:', file.name);
      
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-cv', {
        body: formData,
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('Processing error:', error);
        throw error;
      }

      console.log('Processing completed:', data);

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: 100 } : f
        )
      );

      if (data.isZip) {
        const processedZipFiles = data.processedFiles.map((result: any) => ({
          ...file,
          name: result.fileName,
          processed: true,
          score: result.score,
          matchPercentage: result.matchPercentage,
        }));
        setProcessedFiles(prev => [...prev, ...processedZipFiles]);
      } else {
        setProcessedFiles(prev => [...prev, { ...file, processed: true }]);
      }

      toast({
        title: "Processing Complete",
        description: `${file.name} has been processed successfully.`,
      });

      return data;
    } catch (error) {
      console.error('Processing error:', error);
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: undefined } : f
        )
      );
      
      toast({
        title: "Processing Failed",
        description: `Failed to process ${file.name}. Please try again.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadToDatabase = async () => {
    try {
      for (const file of processedFiles) {
        // Create a clean object with only the necessary data
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          preview: file.preview,
          score: file.score || 0,
          matchPercentage: file.matchPercentage || 0,
        };

        console.log('Uploading file data:', fileData);

        const { error } = await supabase.functions.invoke('upload-cv', {
          body: JSON.stringify(fileData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }
      }

      toast({
        title: "Upload Complete",
        description: "All files have been uploaded to the database successfully.",
      });

      setFiles([]);
      setProcessedFiles([]);
    } catch (error) {
      console.error('Upload to database failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files to database. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    setProcessedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const handleProcess = async (file: FileWithPreview) => {
    try {
      await processFile(file);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  };

  return {
    files,
    setFiles,
    processedFiles,
    removeFile,
    handleProcess,
    uploadToDatabase
  };
};