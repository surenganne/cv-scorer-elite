import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "@/types/file";

export const useFileUpload = () => {
  const { toast } = useToast();

  const uploadToDatabase = async (processedFiles: FileWithPreview[]) => {
    try {
      for (const file of processedFiles) {
        // Create a safe copy of the file data with only the needed properties
        const fileData = {
          name: file.file.name,
          type: file.file.type,
          size: file.file.size,
          preview: file.preview || '',
        };

        console.log('Uploading file data:', fileData);

        const { error } = await supabase.functions.invoke('upload-cv', {
          body: JSON.stringify(fileData),
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

      return true;
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

  return { uploadToDatabase };
};