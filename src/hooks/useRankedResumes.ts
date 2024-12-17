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
  matching_details?: {
    matching_skills: string[];
    matching_education: string[];
    matching_experience: string[];
    matching_certifications: string[];
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

        if (!checkData?.ranked_resumes) {
          console.log("No data found for job ID:", jobId);
          return [];
        }

        // Return the ranked_resumes array directly since it's already in the correct format
        return checkData.ranked_resumes as RankedResume[];
      } catch (error) {
        console.error("Error in useRankedResumes:", error);
        throw error;
      }
    },
    enabled: Boolean(jobId),
  });
};