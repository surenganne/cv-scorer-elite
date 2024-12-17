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
      console.log("Query parameters:", { jobId });
      
      try {
        console.log("Executing Supabase query...");
        const { data, error } = await supabase
          .from("edb-cv-ranking")
          .select('*')
          .eq('job_id', jobId);

        console.log("Full Supabase response:", { data, error });

        if (error) {
          console.error("Error fetching ranked resumes:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.log("No data found for job ID:", jobId);
          return [];
        }

        console.log("Raw data from database:", data);

        // Get the first result since we expect only one record per job
        const record = data[0];
        
        if (!record.ranked_resumes) {
          console.log("No ranked_resumes found in the record:", record);
          return [];
        }

        try {
          console.log("Attempting to parse ranked_resumes:", record.ranked_resumes);
          const parsedResumes = typeof record.ranked_resumes === 'string' 
            ? JSON.parse(record.ranked_resumes) 
            : record.ranked_resumes;
          
          console.log("Successfully parsed resumes:", parsedResumes);
          
          if (!Array.isArray(parsedResumes)) {
            console.log("Parsed data is not an array:", parsedResumes);
            return [];
          }
          
          const topResumes = parsedResumes.slice(0, 10);
          console.log("Returning top 10 resumes:", topResumes);
          return topResumes;
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