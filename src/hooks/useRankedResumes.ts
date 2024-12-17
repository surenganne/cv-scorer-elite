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

// Type guard to validate if an object is a RankedResume
function isRankedResume(obj: any): obj is RankedResume {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.rank === 'string' &&
    typeof obj.file_name === 'string' &&
    typeof obj.overall_match_with_jd === 'string' &&
    typeof obj.weights === 'object' &&
    obj.weights !== null &&
    typeof obj.matching_details === 'object' &&
    obj.matching_details !== null &&
    Array.isArray(obj.matching_details.matching_skills) &&
    Array.isArray(obj.matching_details.matching_education) &&
    Array.isArray(obj.matching_details.matching_experience) &&
    Array.isArray(obj.matching_details.matching_certifications)
  );
}

// Type guard to validate if an array is RankedResume[]
function isRankedResumeArray(arr: any): arr is RankedResume[] {
  return Array.isArray(arr) && arr.every(isRankedResume);
}

export const useRankedResumes = (jobId: string | null) => {
  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      if (!jobId) return null;

      console.log("Fetching ranked resumes for job ID:", jobId);

      const { data, error } = await supabase
        .from("edb_cv_ranking")
        .select("ranked_resumes")
        .eq("job_id", jobId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching ranked resumes:", error);
        throw error;
      }

      console.log("Raw data from Supabase:", data);

      if (!data?.ranked_resumes) {
        console.log("No ranked resumes found for job ID:", jobId);
        return null;
      }

      // First cast to unknown, then validate
      const jsonData = data.ranked_resumes as unknown;
      
      if (!isRankedResumeArray(jsonData)) {
        console.error("Invalid ranked resumes data structure:", jsonData);
        return null;
      }

      console.log("Validated ranked resumes:", jsonData);
      return jsonData;
    },
    enabled: !!jobId,
  });
};