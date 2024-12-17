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
      console.log("Fetching ranked resumes for job ID:", jobId);
      
      const { data, error } = await supabase
        .from("edb-cv-ranking")
        .select("*")
        .eq("job_id", jobId);

      if (error) {
        console.error("Error fetching ranked resumes:", error);
        throw error;
      }
      
      console.log("Raw data from Supabase:", data);
      
      if (!data || data.length === 0 || !data[0]?.ranked_resumes) {
        console.log("No ranked resumes found");
        return [];
      }

      // Parse the ranked_resumes JSON if it's a string
      const jsonData = typeof data[0].ranked_resumes === 'string' 
        ? JSON.parse(data[0].ranked_resumes) 
        : data[0].ranked_resumes;

      console.log("Parsed JSON data:", jsonData);

      if (!Array.isArray(jsonData)) {
        console.log("Ranked resumes is not an array");
        return [];
      }

      // Transform the data to match our expected format
      const rankedResumes = jsonData.map((item: RankedResumeResponse) => ({
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

      console.log("Transformed ranked resumes:", rankedResumes);
      return rankedResumes;
    },
    enabled: !!jobId,
  });
};