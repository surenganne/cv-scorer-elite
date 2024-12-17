import { FileWithPreview } from "@/types/file";
import { useToast } from "./use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractFilesFromZip } from "@/utils/zipUtils";

export const useFileProcessor = () => {
  const { toast } = useToast();

  const processFile = async (file: FileWithPreview, updateProgress: (progress: number) => void) => {
    try {
      updateProgress(0);
      console.log('Starting processing for:', file.file.name, 'Size:', file.file.size, 'bytes');
      
      if (file.file.type === 'application/zip' || file.file.type === 'application/x-zip-compressed') {
        // Handle ZIP files
        updateProgress(10);
        const extractedFiles = await extractFilesFromZip(file.file);
        console.log(`Successfully extracted ${extractedFiles.length} files from ZIP`);
        updateProgress(100);
        return extractedFiles;
      } else {
        // Handle individual files
        try {
          updateProgress(20);

          // Process the file without uploading
          const formData = new FormData();
          formData.append('file', file.file);
          
          const { data, error } = await supabase.functions.invoke('process-cv', {
            body: formData,
          });

          if (error) throw error;

          updateProgress(100);
          
          const processedFile: FileWithPreview = {
            ...file,
            file: file.file,
            preview: file.preview
          };

          toast({
            title: "Processing Complete",
            description: `Successfully processed ${file.file.name}.`,
          });

          return [processedFile];
        } catch (error) {
          console.error('Processing error:', error);
          toast({
            title: "Processing Failed",
            description: `Failed to process ${file.file.name}. Please try again.`,
            variant: "destructive",
          });
          throw error;
        }
      }
    } catch (error) {
      console.error('File processing error:', error);
      updateProgress(0);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the file.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { processFile };
};