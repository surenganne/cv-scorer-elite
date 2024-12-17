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
        // Using double quotes for the table name since it contains a hyphen
        const { data, error } = await supabase
          .from("edb-cv-ranking")
          .select('*')  // Select all columns to debug
          .eq('job_id', jobId)
          .single();

        console.log("Full Supabase response:", { data, error });

        if (error) {
          console.error("Error fetching ranked resumes:", error);
          throw error;
        }

        if (!data) {
          console.log("No data found for job ID:", jobId);
          return [];
        }

        if (!data.ranked_resumes) {
          console.log("No ranked resumes found for job ID:", jobId);
          return [];
        }

        try {
          // If ranked_resumes is already an object/array, no need to parse
          const parsedResumes = typeof data.ranked_resumes === 'string' 
            ? JSON.parse(data.ranked_resumes) 
            : data.ranked_resumes;
          
          return Array.isArray(parsedResumes) ? parsedResumes.slice(0, 10) : [];
        } catch (e) {
          console.error("Error parsing ranked resumes:", e);
          return [];
        }
      } catch (error) {
        console.error("Error in useRankedResumes:", error);
        throw error;
      }
    },
    enabled: Boolean(jobId),
    retry: false,
  });
};