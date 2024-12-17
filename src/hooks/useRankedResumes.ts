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

      console.log("Raw ranked resumes data:", data.ranked_resumes);
      return data.ranked_resumes;
    },
  });
};