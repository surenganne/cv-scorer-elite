import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CVTable } from "@/components/cv-analysis/CVTable";
import { CVFilters } from "@/components/cv-analysis/CVFilters";
import Navbar from "@/components/layout/Navbar";

const ManageCVs = () => {
  const { data: cvs, isLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cv_uploads")
        .select("*")
        .order("upload_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Manage CVs</h1>
          <Link to="/upload-cvs">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload CVs
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <CVFilters />
          {isLoading ? (
            <div className="text-center py-4">Loading CVs...</div>
          ) : (
            <CVTable data={cvs} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCVs;