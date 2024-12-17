import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRankedResumes = (jobId: string) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      console.log("Fetching ranked resumes for job:", jobId);
      
      try {
        const { data, error } = await supabase
          .from("edb-cv-ranking")
          .select("ranked_resumes")
          .eq("job_id", jobId)
          .single();

        if (error) {
          console.error("Error fetching ranked resumes:", error);
          throw error;
        }

        // If no data is found, return an empty array
        if (!data) {
          console.log("No ranked resumes found for job:", jobId);
          return [];
        }

        // Parse the ranked_resumes if it's a string
        const rankedResumes = typeof data.ranked_resumes === 'string' 
          ? JSON.parse(data.ranked_resumes) 
          : data.ranked_resumes;

        console.log("Fetched ranked resumes:", rankedResumes);
        return Array.isArray(rankedResumes) ? rankedResumes : [];
      } catch (error) {
        console.error("Error in useRankedResumes:", error);
        throw error;
      }
    },
  });
};