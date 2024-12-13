import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "@/types/file";
import { extractFilesFromZip } from "@/utils/zipUtils";

export const useFileProcessor = () => {
  const { toast } = useToast();

  const processFile = async (file: FileWithPreview, updateProgress: (progress: number) => void) => {
    try {
      updateProgress(0);
      console.log('Starting processing for:', file.name, 'Size:', file.size, 'bytes');
      
      if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
        const extractedFiles = await extractFilesFromZip(file);
        console.log(`Successfully extracted ${extractedFiles.length} files from ZIP`);

        const processedFiles: FileWithPreview[] = [];
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
              processed: { value: true, writable: true, enumerable: true },
              score: { value: data.score || 0, writable: true, enumerable: true },
              matchPercentage: { value: data.matchPercentage || 0, writable: true, enumerable: true },
              progress: { value: 100, writable: true, enumerable: true }
            });
            processedFiles.push(processedFile);
          }
        }

        updateProgress(100);
        toast({
          title: "ZIP Processing Complete",
          description: `Processed ${extractedFiles.length} files from ${file.name}`,
        });

        return processedFiles;
      } else {
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke('process-cv', {
          body: formData,
        });

        if (error) throw error;

        const processedFile = Object.create(file, {
          processed: { value: true, writable: true, enumerable: true },
          score: { value: data?.score || 0, writable: true, enumerable: true },
          matchPercentage: { value: data?.matchPercentage || 0, writable: true, enumerable: true },
          progress: { value: 100, writable: true, enumerable: true }
        });

        updateProgress(100);
        toast({
          title: "Processing Complete",
          description: `${file.name} has been processed successfully.`,
        });

        return [processedFile];
      }
    } catch (error) {
      console.error('Processing error:', error);
      updateProgress(undefined);
      toast({
        title: "Processing Failed",
        description: `Failed to process ${file.name}. Please try again.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  return { processFile };
};