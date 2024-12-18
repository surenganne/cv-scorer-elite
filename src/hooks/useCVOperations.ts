import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCVOperations = () => {
  const { toast } = useToast();

  const handleViewCV = async (fileName: string) => {
    try {
      if (!fileName) {
        throw new Error("Invalid file name");
      }

      // Get the file path from cv_uploads table
      const { data: fileData, error: fetchError } = await supabase
        .from("cv_uploads")
        .select("file_path")
        .ilike("file_path", `%${fileName}`)
        .single();

      if (fetchError || !fileData) {
        throw new Error("File not found in database");
      }

      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(fileData.file_path, 3600); // 1 hour expiration

      if (error) {
        console.error("Storage error:", error);
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error("No signed URL returned");
      }

      // For Office documents, we can use Microsoft's Office Online viewer
      const extension = fileData.file_path.split('.').pop()?.toLowerCase();
      if (extension === 'doc' || extension === 'docx') {
        const encodedUrl = encodeURIComponent(data.signedUrl);
        window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`, "_blank", "noopener,noreferrer");
      } else {
        // For PDFs and other files, open directly
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error viewing CV:", error);
      toast({
        title: "Error",
        description: error.message || "Could not view the CV. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleViewCV };
};