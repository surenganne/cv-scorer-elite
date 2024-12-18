import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCVOperations } from "@/hooks/useCVOperations";
import { useEffect } from "react";

interface LocationState {
  candidateName: string;
  filePath: string;
}

export const ViewResume = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleViewCV } = useCVOperations();
  const { candidateName, filePath } = location.state as LocationState;

  useEffect(() => {
    if (filePath) {
      handleViewCV(filePath);
    }
  }, [filePath]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Candidates
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">
        Viewing Resume: {candidateName}
      </h1>
    </div>
  );
};