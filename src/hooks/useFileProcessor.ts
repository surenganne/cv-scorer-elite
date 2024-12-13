import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "@/types/file";
import { extractFilesFromZip } from "@/utils/zipUtils";

export const useFileProcessor = () => {
  const { toast } = useToast();

  const processFile = async (file: FileWithPreview, updateProgress: (progress: number) => void) => {
    try {
      updateProgress(0);
      console.log('Starting processing for:', file.file.name, 'Size:', file.file.size, 'bytes');
      
      if (file.file.type === 'application/zip' || file.file.type === 'application/x-zip-compressed') {
        updateProgress(10);
        const extractedFiles = await extractFilesFromZip(file.file);
        console.log(`Successfully extracted ${extractedFiles.length} files from ZIP`);
        updateProgress(20);

        const processedFiles: FileWithPreview[] = [];
        let processedCount = 0;
        const totalFiles = extractedFiles.length;
        
        for (const extractedFile of extractedFiles) {
          const formData = new FormData();
          formData.append('file', extractedFile.file);

          try {
            const currentProgress = 20 + Math.round((processedCount / totalFiles) * 80);
            updateProgress(currentProgress);
            
            const { data, error } = await supabase.functions.invoke('process-cv', {
              body: formData,
            });

            if (error) {
              console.error('Processing error:', error);
              continue;
            }

            if (data) {
              processedFiles.push({
                file: extractedFile.file,
                processed: true,
                score: data.score || 0,
                matchPercentage: data.matchPercentage || 0,
                progress: 100,
                preview: extractedFile.preview,
                webkitRelativePath: extractedFile.file.webkitRelativePath
              });
            }
            
            processedCount++;
            const newProgress = 20 + Math.round((processedCount / totalFiles) * 80);
            updateProgress(newProgress);
          } catch (error) {
            console.error('Error processing file:', error);
            continue;
          }
        }

        updateProgress(100);
        toast({
          title: "ZIP Processing Complete",
          description: `Processed ${processedCount} out of ${totalFiles} files from ${file.file.name}`,
        });

        return processedFiles;
      } else {
        const formData = new FormData();
        formData.append('file', file.file);

        const { data, error } = await supabase.functions.invoke('process-cv', {
          body: formData,
        });

        if (error) throw error;

        const processedFile: FileWithPreview = {
          file: file.file,
          processed: true,
          score: data?.score || 0,
          matchPercentage: data?.matchPercentage || 0,
          progress: 100,
          preview: file.preview,
          webkitRelativePath: file.file.webkitRelativePath
        };

        updateProgress(100);
        toast({
          title: "Processing Complete",
          description: `${file.file.name} has been processed successfully.`,
        });

        return [processedFile];
      }
    } catch (error) {
      console.error('Processing error:', error);
      updateProgress(undefined);
      toast({
        title: "Processing Failed",
        description: `Failed to process ${file.file.name}. Please try again.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  return { processFile };
};