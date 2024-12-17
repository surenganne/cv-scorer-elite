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
      console.log("Starting fetch for job ID:", jobId);
      
      const { data, error } = await supabase
        .from("edb-cv-ranking")
        .select("ranked_resumes")
        .eq("job_id", jobId)
        .single();

      console.log("Raw Supabase response:", { data, error });

      if (error) throw error;
      if (!data?.ranked_resumes) {
        console.log("No ranked resumes data found");
        return [];
      }

      const parsedResumes = JSON.parse(data.ranked_resumes as string) as RankedResume[];
      return parsedResumes.slice(0, 10); // Only return top 10 results
    },
  });
};