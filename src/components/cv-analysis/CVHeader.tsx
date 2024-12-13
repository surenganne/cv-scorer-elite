import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";

export const CVHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">Manage CVs</h1>
      <Link to="/upload-cvs">
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload CVs
        </Button>
      </Link>
    </div>
  );
};