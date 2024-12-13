import { useState } from "react";
import { FileWithPreview } from "@/types/file";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import JSZip from "jszip";

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

      console.log('Starting processing for:', file.name);
      
      // Check if file is a ZIP
      if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        const extractedFiles: File[] = [];
        let processedCount = 0;
        const totalFiles = Object.keys(zipContent.files).length;

        // Extract files from ZIP
        for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
          if (!zipEntry.dir) {
            const extension = filename.split('.').pop()?.toLowerCase();
            if (extension && ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
              try {
                const content = await zipEntry.async('blob');
                const extractedFile = new File([content], filename, { type: `application/${extension}` });
                extractedFiles.push(extractedFile);
                processedCount++;
                
                // Update progress
                const progress = (processedCount / totalFiles) * 100;
                setFiles((prevFiles) =>
                  prevFiles.map((f) =>
                    f === file ? { ...f, progress } : f
                  )
                );
              } catch (error) {
                console.error(`Failed to extract ${filename}:`, error);
              }
            }
          }
        }

        console.log(`Extracted ${extractedFiles.length} valid files from ZIP`);

        // Process each extracted file
        for (const extractedFile of extractedFiles) {
          const formData = new FormData();
          formData.append('file', extractedFile);

          const { data, error } = await supabase.functions.invoke('process-cv', {
            body: formData,
          });

          if (error) {
            console.error('Processing error:', error);
            continue;
          }

          if (data) {
            setProcessedFiles(prev => [...prev, {
              ...extractedFile,
              preview: URL.createObjectURL(extractedFile),
              processed: true,
              score: data.score,
              matchPercentage: data.matchPercentage,
            }]);
          }
        }

        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f === file ? { ...f, progress: 100 } : f
          )
        );

        toast({
          title: "ZIP Processing Complete",
          description: `Processed ${extractedFiles.length} files from ${file.name}`,
        });
      } else {
        // Handle single file processing (existing code)
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke('process-cv', {
          body: formData,
        });

        if (error) {
          console.error('Processing error:', error);
          throw error;
        }

        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f === file ? { ...f, progress: 100 } : f
          )
        );
        
        setProcessedFiles(prev => [...prev, { ...file, processed: true }]);

        toast({
          title: "Processing Complete",
          description: `${file.name} has been processed successfully.`,
        });
      }
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