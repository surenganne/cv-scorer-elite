import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RankedResume } from "@/types/cv-analysis";
import type { Json } from "@/integrations/supabase/types";

// Type guard to validate if a Json value matches RankedResume structure
function isValidRankedResume(item: Json): item is RankedResume & { [key: string]: Json } {
  if (!item || typeof item !== 'object') return false;
  
  const resume = item as Record<string, unknown>;
  const weights = resume.weights as Record<string, unknown>;
  
  return (
    typeof resume.rank === 'string' &&
    typeof resume.file_name === 'string' &&
    typeof resume.overall_match_with_jd === 'string' &&
    weights !== null &&
    typeof weights === 'object' &&
    typeof weights.skills_weight === 'string' &&
    typeof weights.education_weight === 'string' &&
    typeof weights.experience_weight === 'string' &&
    typeof weights.certifications_weight === 'string'
  );
}

export const useRankedResumes = (jobId: string) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      if (!jobId) {
        console.log("No job ID provided");
        return [] as RankedResume[];
      }

      console.log("Starting fetch for job ID:", jobId);
      
      try {
        const { data: checkData, error: checkError } = await supabase
          .from('edb_cv_ranking')
          .select('ranked_resumes')
          .eq('job_id', jobId)
          .single();

        console.log("Check query response:", { data: checkData, error: checkError });

        if (checkError) {
          console.error("Error checking for job data:", checkError);
          throw checkError;
        }

        if (!checkData?.ranked_resumes || !Array.isArray(checkData.ranked_resumes)) {
          console.log("No valid data found for job ID:", jobId);
          return [] as RankedResume[];
        }

        // Filter and validate the ranked resumes
        const validRankedResumes = checkData.ranked_resumes
          .filter(isValidRankedResume) as RankedResume[];
        
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