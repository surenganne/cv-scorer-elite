import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "@/types/file";
import { extractFilesFromZip } from "@/utils/zipUtils";
import { useFileState } from "./useFileState";

export const useFileProcessing = () => {
  const {
    files,
    setFiles,
    processedFiles,
    setProcessedFiles,
    removeFile,
  } = useFileState();
  const { toast } = useToast();

  const processFile = async (file: FileWithPreview) => {
    try {
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: 0 } : f
        )
      );

      console.log('Starting processing for:', file.name, 'Size:', file.size, 'bytes');
      
      if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
        const extractedFiles = await extractFilesFromZip(file);
        console.log(`Successfully extracted ${extractedFiles.length} files from ZIP`);

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
            const processedFile = Object.create(extractedFile, {
              processed: {
                value: true,
                writable: true,
                enumerable: true,
                configurable: true
              },
              score: {
                value: data.score || 0,
                writable: true,
                enumerable: true,
                configurable: true
              },
              matchPercentage: {
                value: data.matchPercentage || 0,
                writable: true,
                enumerable: true,
                configurable: true
              },
              progress: {
                value: 100,
                writable: true,
                enumerable: true,
                configurable: true
              }
            });
            
            setProcessedFiles(prev => [...prev, processedFile]);
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
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke('process-cv', {
          body: formData,
        });

        if (error) throw error;

        const processedFile = Object.create(file, {
          processed: {
            value: true,
            writable: true,
            enumerable: true,
            configurable: true
          },
          score: {
            value: data?.score || 0,
            writable: true,
            enumerable: true,
            configurable: true
          },
          matchPercentage: {
            value: data?.matchPercentage || 0,
            writable: true,
            enumerable: true,
            configurable: true
          },
          progress: {
            value: 100,
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f === file ? { ...f, progress: 100 } : f
          )
        );
        
        setProcessedFiles(prev => [...prev, processedFile]);

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
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          preview: file.preview,
          score: file.score || 0,
          matchPercentage: file.matchPercentage || 0,
        };

        const { error } = await supabase.functions.invoke('upload-cv', {
          body: JSON.stringify(fileData),
        });

        if (error) throw error;
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