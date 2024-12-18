import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCVOperations = () => {
  const { toast } = useToast();

  const handleViewCV = async (fileName: string) => {
    try {
      if (!fileName) {
        throw new Error("Invalid file name");
      }

      // First get the file path from cv_uploads table
      const { data: cvData, error: cvError } = await supabase
        .from("cv_uploads")
        .select("file_path")
        .ilike("file_name", fileName)
        .single();

      if (cvError || !cvData) {
        console.error("Error fetching CV data:", cvError);
        throw new Error("Could not find the CV file");
      }

      const filePath = cvData.file_path;
      console.log("Found file path:", filePath);

      // Check if the file exists in storage
      const { data: fileExists, error: existsError } = await supabase.storage
        .from("cvs")
        .list("", {
          search: filePath
        });

      if (existsError) {
        console.error("Error checking file existence:", existsError);
        throw existsError;
      }

      if (!fileExists || fileExists.length === 0) {
        throw new Error("File not found in storage");
      }

      // Create signed URL with longer expiration for viewing
      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(filePath, 3600); // 1 hour expiration

      if (error) {
        console.error("Storage error:", error);
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error("No signed URL returned");
      }

      // For Office documents, we can use Microsoft's Office Online viewer
      const extension = filePath.split('.').pop()?.toLowerCase();
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

  const handleDownloadCV = async (filePath: string, fileName: string) => {
    try {
      if (!filePath) {
        throw new Error("Invalid file path");
      }

      console.log("Attempting to download:", filePath);

      // First check if the file exists
      const { data: fileExists, error: existsError } = await supabase.storage
        .from("cvs")
        .list("", {
          search: filePath
        });

      if (existsError) {
        console.error("Error checking file existence:", existsError);
        throw existsError;
      }

      if (!fileExists || fileExists.length === 0) {
        throw new Error("File not found in storage");
      }

      const { data, error } = await supabase.storage
        .from("cvs")
        .download(filePath);

      if (error) {
        console.error("Download error:", error);
        throw error;
      }

      // Create a download link
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast({
        title: "Error",
        description: error.message || "Could not download the CV. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleViewCV, handleDownloadCV };
};