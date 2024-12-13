import { CVTable } from "@/components/cv-analysis/CVTable";
import { CVFilters } from "@/components/cv-analysis/CVFilters";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CVAnalysis = () => {
  const { toast } = useToast();

  const handleViewCV = async (filePath: string) => {
    try {
      if (!filePath) {
        throw new Error("Invalid file path");
      }

      console.log("Original file path:", filePath);
      
      // Get just the filename without any URL or blob prefix
      const fileName = filePath.split('/').pop();
      
      if (!fileName) {
        throw new Error("Could not extract file name from path");
      }

      console.log("Attempting to get signed URL for:", fileName);

      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(fileName, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
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

      console.log("Original file path:", filePath);
      
      // Get just the filename without any URL or blob prefix
      const storedFileName = filePath.split('/').pop();
      
      if (!storedFileName) {
        throw new Error("Could not extract file name from path");
      }

      console.log("Attempting to download:", storedFileName);

      const { data, error } = await supabase.storage
        .from("cvs")
        .download(storedFileName);

      if (error) throw error;
      
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CVFilters />
        <div className="mt-6">
          <CVTable 
            onView={handleViewCV}
            onDownload={handleDownloadCV}
          />
        </div>
      </main>
    </div>
  );
};

export default CVAnalysis;