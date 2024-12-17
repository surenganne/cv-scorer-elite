import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RankedResume {
  id: string;
  file_name: string;
  file_path?: string;
  score: number;
  matched_skills?: string[];
  experience_summary?: string;
  education_summary?: string;
  certifications?: string[];
}

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
      
      // Ensure we return an array of ranked resumes or an empty array
      const rankedResumes = data?.ranked_resumes as RankedResume[] || [];
      return rankedResumes;
    },
    enabled: !!jobId,
  });
};