import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRankedResumes = (jobId: string) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edb-cv-ranking")
        .select("*")
        .eq("job_id", jobId)
        .single();

      if (error) throw error;
      return data?.ranked_resumes || null;
    },
    enabled: !!jobId,
  });
};