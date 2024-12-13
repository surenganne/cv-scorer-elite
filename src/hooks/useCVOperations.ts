import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCVOperations = () => {
  const { toast } = useToast();

  const handleViewCV = async (filePath: string) => {
    try {
      if (!filePath) {
        throw new Error("Invalid file path");
      }

      // Get just the filename without any path
      const fileName = filePath.split('/').pop();
      
      if (!fileName) {
        throw new Error("Could not extract file name from path");
      }

      console.log("Attempting to get signed URL for:", fileName);

      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(fileName, 60);

      if (error) {
        console.error("Storage error:", error);
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error("No signed URL returned");
      }

      // Open in new tab
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error viewing CV:", error);
      toast({
        title: "Error",
        description: "Could not view the CV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCV = async (filePath: string, fileName: string) => {
    try {
      if (!filePath) {
        throw new Error("Invalid file path");
      }

      // Get just the filename without any path
      const storedFileName = filePath.split('/').pop();
      
      if (!storedFileName) {
        throw new Error("Could not extract file name from path");
      }

      console.log("Attempting to download:", storedFileName);

      const { data, error } = await supabase.storage
        .from("cvs")
        .download(storedFileName);

      if (error) {
        console.error("Storage error:", error);
        throw error;
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // Use the original file name for download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast({
        title: "Error",
        description: "Could not download the CV. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    handleViewCV,
    handleDownloadCV,
  };
};