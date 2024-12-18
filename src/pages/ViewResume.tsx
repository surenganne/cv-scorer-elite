import { useParams } from "react-router-dom";
import { useCVOperations } from "@/hooks/useCVOperations";

const ViewResume = () => {
  const { fileName } = useParams();
  const { handleViewCV } = useCVOperations();

  // Automatically trigger view on component mount
  if (fileName) {
    handleViewCV(fileName);
  }

  return null; // This component doesn't render anything as it just triggers the view
};

export default ViewResume;