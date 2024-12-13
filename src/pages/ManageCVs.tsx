import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CVTable } from "@/components/cv-analysis/CVTable";
import { CVFilters } from "@/components/cv-analysis/CVFilters";
import { CVHeader } from "@/components/cv-analysis/CVHeader";
import { useCVOperations } from "@/hooks/useCVOperations";
import Navbar from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 10;

const ManageCVs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleViewCV, handleDownloadCV } = useCVOperations();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('cv-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cv_uploads'
        },
        (payload) => {
          // Show toast for new CV
          toast({
            title: "New CV Uploaded",
            description: `${payload.new.file_name} has been uploaded.`,
          });
          // Invalidate and refetch CVs
          queryClient.invalidateQueries({ queryKey: ['cvs'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cv_uploads'
        },
        (payload) => {
          // Show toast for updated CV
          toast({
            title: "CV Updated",
            description: `${payload.new.file_name} has been updated.`,
          });
          // Invalidate and refetch CVs
          queryClient.invalidateQueries({ queryKey: ['cvs'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'cv_uploads'
        },
        (payload) => {
          // Show toast for deleted CV
          toast({
            title: "CV Deleted",
            description: `A CV has been removed.`,
            variant: "destructive",
          });
          // Invalidate and refetch CVs
          queryClient.invalidateQueries({ queryKey: ['cvs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

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
    // Disable automatic background refetching since we're using real-time updates
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const totalPages = cvs ? Math.ceil(cvs.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCVs = cvs?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when total pages changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CVHeader />
        <div className="mt-8 space-y-6">
          <CVFilters />
          {isLoading ? (
            <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </div>
          ) : (
            <>
              <CVTable 
                data={paginatedCVs} 
                onView={handleViewCV}
                onDownload={handleDownloadCV}
              />
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCVs;