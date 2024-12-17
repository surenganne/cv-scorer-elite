import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRankedResumes = (jobId: string) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      console.log("Starting fetch for job ID:", jobId);
      
      try {
        // Remove .single() and handle the array response
        const { data, error } = await supabase
          .from("edb-cv-ranking")
          .select("ranked_resumes")
          .eq("job_id", jobId);

        console.log("Raw Supabase response:", { data, error });

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        // Handle case when no data is found
        if (!data || data.length === 0) {
          console.log("No ranked resumes data found");
          return [];
        }

        // Get the first result if it exists
        const firstResult = data[0];
        
        if (!firstResult.ranked_resumes) {
          console.log("No ranked_resumes field in data");
          return [];
        }

        let rankedResumes;
        try {
          rankedResumes = typeof firstResult.ranked_resumes === 'string' 
            ? JSON.parse(firstResult.ranked_resumes) 
            : firstResult.ranked_resumes;
          
          console.log("Parsed ranked resumes:", rankedResumes);
          
          if (!Array.isArray(rankedResumes)) {
            console.warn("Ranked resumes is not an array:", rankedResumes);
            return [];
          }

          return rankedResumes;
        } catch (e) {
          console.error("Error parsing ranked_resumes:", e);
          return [];
        }
      } catch (error) {
        console.error("Error in useRankedResumes:", error);
        throw error;
      }
    },
  });
};