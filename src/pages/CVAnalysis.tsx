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

      // Clean the file path by removing any blob: prefix and getting just the UUID part
      const cleanPath = filePath.replace(/^blob:.*\//, '');

      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(cleanPath, 60);

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

      // Clean the file path by removing any blob: prefix and getting just the UUID part
      const cleanPath = filePath.replace(/^blob:.*\//, '');

      const { data, error } = await supabase.storage
        .from("cvs")
        .download(cleanPath);

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