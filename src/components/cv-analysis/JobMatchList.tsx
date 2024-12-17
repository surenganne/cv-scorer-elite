import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody } from "@/components/ui/table";
import { useRankedResumes } from "@/hooks/useRankedResumes";
import { RankedResumesList } from "./RankedResumesList";
import { TableHeaderComponent } from "./TableHeader";
import { TableRowComponent } from "./TableRowComponent";

interface JobMatch {
  id: string;
  title: string;
  minimum_experience: number;
  created_at: string;
}

export const JobMatchList = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { data: rankedResumes, isLoading: isLoadingMatches } = useRankedResumes(selectedJobId);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const { data: activeJobs } = useQuery({
    queryKey: ["activeJobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_descriptions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as JobMatch[];
    },
  });

  const findMatches = async (jobId: string) => {
    console.log("Finding matches for job ID:", jobId);
    
    try {
      // First, trigger the ranking process
      const { data: rankingData, error: rankingError } = await supabase
        .from('edb_cv_ranking')
        .upsert([
          {
            job_id: jobId,
            ranked_resumes: null // This will be updated by the backend process
          }
        ])
        .select();

      if (rankingError) {
        console.error("Error initiating ranking process:", rankingError);
        return;
      }

      console.log("Ranking process initiated:", rankingData);
      
      // Call the resume ranking API
      const rankingResponse = await fetch('https://3ltge7zfy7j26bdyygdwlcrtse0rcixl.lambda-url.ap-south-1.on.aws/rank-resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobId })
      });

      if (!rankingResponse.ok) {
        console.error('Error from ranking API:', await rankingResponse.text());
        return;
      }

      console.log("Ranking API called successfully");
      setSelectedJobId(jobId);
    } catch (error) {
      console.error("Error in findMatches:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCandidates(checked ? (rankedResumes || []).map(resume => resume.file_name) : []);
  };

  const allSelected = rankedResumes?.length ? selectedCandidates.length === rankedResumes.length : false;

  if (!activeJobs?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active job descriptions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeaderComponent 
          onSelectAll={handleSelectAll}
          allSelected={allSelected}
        />
        <TableBody>
          {activeJobs?.map((job) => (
            <TableRowComponent
              key={job.id}
              job={job}
              onFindMatches={findMatches}
              isLoading={isLoadingMatches && selectedJobId === job.id}
            />
          ))}
        </TableBody>
      </Table>

      {selectedJobId && (
        <RankedResumesList
          resumes={rankedResumes || []}
          isLoading={isLoadingMatches}
        />
      )}
    </div>
  );
};