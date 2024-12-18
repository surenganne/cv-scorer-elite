import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCVOperations } from "@/hooks/useCVOperations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";

const ViewResume = () => {
  const navigate = useNavigate();
  const { filePath } = useParams();
  const { handleViewCV } = useCVOperations();

  const { data: cvData } = useQuery({
    queryKey: ["cv", filePath],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cv_uploads")
        .select("*")
        .eq("file_path", filePath)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!filePath,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold mb-6">
            {cvData?.file_name}
          </h1>
          
          <Button 
            onClick={() => cvData?.file_path && handleViewCV(cvData.file_path)}
            className="gap-2"
          >
            View Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewResume;