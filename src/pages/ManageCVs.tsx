import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CVTable } from "@/components/cv-analysis/CVTable";
import { CVFilters } from "@/components/cv-analysis/CVFilters";
import Navbar from "@/components/layout/Navbar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

const ManageCVs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

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

  const handleViewCV = async (filePath: string) => {
    try {
      if (!filePath) {
        throw new Error("Invalid file path");
      }

      console.log("Attempting to get signed URL for file path:", filePath);

      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(filePath, 60);

      if (error) {
        console.error("Storage error:", error);
        throw error;
      }

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

      console.log("Attempting to download file path:", filePath);

      const { data, error } = await supabase.storage
        .from("cvs")
        .download(filePath);

      if (error) {
        console.error("Storage error:", error);
        throw error;
      }
      
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

  const totalPages = cvs ? Math.ceil(cvs.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCVs = cvs?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
            <>
              <CVTable 
                data={paginatedCVs} 
                onView={handleViewCV}
                onDownload={handleDownloadCV}
              />
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCVs;