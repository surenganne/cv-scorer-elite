import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface RankedResumeResponse {
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

export interface RankedResume {
  id: string;
  file_name: string;
  score: number;
  evidence: {
    skills: string[];
    experience: string;
    education: string;
    certifications: string[];
  };
}

export const useRankedResumes = (jobId: string) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edb-cv-ranking")
        .select("*")
        .eq("job_id", jobId);

      if (error) throw error;
      
      const jsonData = data?.[0]?.ranked_resumes as unknown as RankedResumeResponse[];
      if (!jsonData || !Array.isArray(jsonData)) {
        return [];
      }

      // Transform the data to match our expected format
      const rankedResumes = jsonData.map(item => ({
        id: `${item.rank}-${item.file_name}`,
        file_name: item.file_name,
        score: parseInt(item.overall_match_with_jd),
        evidence: {
          skills: [], // These will be populated from the CV analysis
          experience: "",
          education: "",
          certifications: []
        }
      }));

      return rankedResumes;
    },
    enabled: !!jobId,
  });
};