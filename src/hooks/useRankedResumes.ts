import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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

// Type guard to validate the structure of a RankedResume
function isRankedResume(item: Json): item is RankedResume {
  if (!item || typeof item !== 'object') return false;
  
  const resume = item as any;
  return (
    typeof resume.rank === 'string' &&
    typeof resume.file_name === 'string' &&
    typeof resume.overall_match_with_jd === 'string' &&
    typeof resume.weights === 'object' &&
    typeof resume.weights.skills_weight === 'string' &&
    typeof resume.weights.education_weight === 'string' &&
    typeof resume.weights.experience_weight === 'string' &&
    typeof resume.weights.certifications_weight === 'string'
  );
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