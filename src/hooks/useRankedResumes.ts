import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRankedResumes = (jobId: string) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      console.log("Fetching ranked resumes for job:", jobId);
      const { data, error } = await supabase
        .from("edb-cv-ranking")
        .select("ranked_resumes")
        .eq("job_id", jobId)
        .single();

      if (error) {
        console.error("Error fetching ranked resumes:", error);
        throw error;
      }

      if (!data?.ranked_resumes) {
        console.log("No ranked resumes found for job:", jobId);
        return [];
      }

      // Ensure we're working with parsed JSON data
      const parsedData = Array.isArray(data.ranked_resumes) 
        ? data.ranked_resumes 
        : typeof data.ranked_resumes === 'string' 
          ? JSON.parse(data.ranked_resumes) 
          : [];

      console.log("Parsed ranked resumes data:", parsedData);
      return parsedData;
    },
  });
};