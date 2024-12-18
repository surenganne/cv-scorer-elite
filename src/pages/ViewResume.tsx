import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCVOperations } from "@/hooks/useCVOperations";
import { useToast } from "@/components/ui/use-toast";

export default function ViewResume() {
  const { fileName } = useParams();
  const navigate = useNavigate();
  const { handleViewCV } = useCVOperations();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndViewCV = async () => {
      try {
        setLoading(true);
        
        // Search for the CV in the database using ILIKE for case-insensitive partial match
        const { data: cvData, error: cvError } = await supabase
          .from('cv_uploads')
          .select('*')
          .ilike('file_name', `%${fileName}%`)
          .single();

        if (cvError) {
          console.error('Error fetching CV:', cvError);
          toast({
            title: "Error",
            description: "Could not find the CV file.",
            variant: "destructive",
          });
          return;
        }

        if (cvData?.file_path) {
          await handleViewCV(cvData.file_path);
        }
      } catch (error) {
        console.error('Error viewing CV:', error);
        toast({
          title: "Error",
          description: "Failed to view the CV. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (fileName) {
      fetchAndViewCV();
    }
  }, [fileName, handleViewCV, toast]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">
          {loading ? "Loading..." : `Viewing Resume: ${fileName}`}
        </h1>
      </div>
    </div>
  );
}