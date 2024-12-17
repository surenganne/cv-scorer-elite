import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRankedResumes = (jobId: string) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      console.log("Starting fetch for job ID:", jobId);
      
      try {
        const { data, error } = await supabase
          .from("edb-cv-ranking")
          .select("ranked_resumes")
          .eq("job_id", jobId)
          .single();

        console.log("Raw Supabase response:", { data, error });

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        if (!data || !data.ranked_resumes) {
          console.log("No ranked resumes data found:", { data });
          return [];
        }

        let rankedResumes;
        try {
          rankedResumes = typeof data.ranked_resumes === 'string' 
            ? JSON.parse(data.ranked_resumes) 
            : data.ranked_resumes;
          
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