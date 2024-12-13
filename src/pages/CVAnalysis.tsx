import { CVTable } from "@/components/cv-analysis/CVTable";
import { CVFilters } from "@/components/cv-analysis/CVFilters";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";

const CVAnalysis = () => {
  const handleViewCV = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(filePath, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error viewing CV:", error);
    }
  };

  const handleDownloadCV = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("cvs")
        .download(filePath);

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