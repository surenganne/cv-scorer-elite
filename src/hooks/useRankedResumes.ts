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

        // Type guard function to validate the shape of the ranked resume
        const isRankedResume = (item: any): item is RankedResume => {
          return (
            typeof item === 'object' &&
            item !== null &&
            typeof item.rank === 'string' &&
            typeof item.file_name === 'string' &&
            typeof item.overall_match_with_jd === 'string' &&
            typeof item.weights === 'object' &&
            item.weights !== null &&
            typeof item.weights.skills_weight === 'string' &&
            typeof item.weights.education_weight === 'string' &&
            typeof item.weights.experience_weight === 'string' &&
            typeof item.weights.certifications_weight === 'string'
          );
        };

        // Safely type cast the ranked_resumes array
        const rankedResumes = Array.isArray(checkData.ranked_resumes) 
          ? checkData.ranked_resumes.filter(isRankedResume)
          : [];

        console.log("Processed ranked resumes:", rankedResumes);
        return rankedResumes;
      } catch (error) {
        console.error("Error in useRankedResumes:", error);
        throw error;
      }
    },
    enabled: Boolean(jobId),
  });
};