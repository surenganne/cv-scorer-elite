import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RankedResume {
  rank: string;
  file_name: string;
  overall_match_with_jd: string;
  weights: {
    skills_weight: string;
    education_weight: string;
    experience_weight: string;
    certifications_weight: string;
  };
}

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
        // First, let's verify if we have data for this job ID
        const { data: checkData, error: checkError } = await supabase
          .from('edb-cv-ranking')
          .select('*')
          .eq('job_id', jobId)
          .maybeSingle();

        console.log("Check query response:", { data: checkData, error: checkError });

        if (checkError) {
          console.error("Error checking for job data:", checkError);
          throw checkError;
        }

        if (!checkData) {
          console.log("No data found for job ID:", jobId);
          return [];
        }

        // If we have data, parse the ranked_resumes
        if (checkData.ranked_resumes) {
          try {
            const parsedResumes = typeof checkData.ranked_resumes === 'string' 
              ? JSON.parse(checkData.ranked_resumes) 
              : checkData.ranked_resumes;

            console.log("Successfully parsed resumes:", parsedResumes);
            return parsedResumes as RankedResume[];
          } catch (parseError) {
            console.error("Error parsing ranked resumes:", parseError);
            return [];
          }
        }

        return [];
      } catch (error) {
        console.error("Error in useRankedResumes:", error);
        throw error;
      }
    },
    enabled: Boolean(jobId),
  });
};