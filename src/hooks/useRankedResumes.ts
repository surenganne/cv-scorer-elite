import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MatchingDetails {
  matching_skills: string[];
  matching_education: string[];
  matching_experience: string[];
  matching_certifications: string[];
}

export interface RankedResume {
  rank: string;
  weights: {
    skills_weight: string;
    education_weight: string;
    experience_weight: string;
    certifications_weight: string;
  };
  file_name: string;
  matching_details: MatchingDetails;
  overall_match_with_jd: string;
}

export const useRankedResumes = (jobId: string | null) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      if (!jobId) return null;

      const { data, error } = await supabase
        .from("edb_cv_ranking")
        .select("ranked_resumes")
        .eq("job_id", jobId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching ranked resumes:", error);
        throw error;
      }

      return data?.ranked_resumes as RankedResume[] | null;
    },
    enabled: !!jobId,
  });
};