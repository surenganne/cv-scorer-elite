import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const UploadHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900">Upload CVs</h1>
      <Link to="/">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
};

export default UploadHeader;