import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RankedResume, isRankedResume } from "@/types/cv-analysis";

export const useRankedResumes = (jobId: string) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      if (!jobId) {
        console.log("No job ID provided");
        return [];
      }

      console.log("Starting fetch for job ID:", jobId);
      
      try {
        const { data: checkData, error: checkError } = await supabase
          .from('edb_cv_ranking')
          .select('ranked_resumes')
          .eq('job_id', jobId)
          .maybeSingle();

        console.log("Check query response:", { data: checkData, error: checkError });

        if (checkError) {
          console.error("Error checking for job data:", checkError);
          throw checkError;
        }

        if (!checkData?.ranked_resumes || !Array.isArray(checkData.ranked_resumes)) {
          console.log("No valid data found for job ID:", jobId);
          return [];
        }

        // Filter and validate the ranked resumes
        const validRankedResumes = checkData.ranked_resumes.filter(isRankedResume);
        console.log("Processed ranked resumes:", validRankedResumes);
        
        return validRankedResumes;
      } catch (error) {
        console.error("Error in useRankedResumes:", error);
        throw error;
      }
    },
    enabled: Boolean(jobId),
  });
};