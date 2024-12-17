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
  console.log("useRankedResumes hook called with jobId:", jobId);

  return useQuery({
    queryKey: ["rankedResumes", jobId],
    queryFn: async () => {
      console.log("Starting to fetch ranked resumes for job ID:", jobId);
      
      // Convert UUID to string format if needed
      const jobIdString = jobId.toString();
      
      const { data, error } = await supabase
        .from("edb-cv-ranking")
        .select("*")
        .eq("job_id", jobIdString);

      console.log("Supabase query completed");
      console.log("Raw response data:", data);
      console.log("Any errors:", error);

      if (error) {
        console.error("Error fetching ranked resumes:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No data returned from Supabase");
        return [];
      }

      // Get the first row since we're querying by job_id
      const rankingData = data[0];

      if (!rankingData?.ranked_resumes) {
        console.log("No ranked_resumes field in the data:", rankingData);
        return [];
      }

      // Parse the ranked_resumes JSON if it's a string
      const jsonData = typeof rankingData.ranked_resumes === 'string' 
        ? JSON.parse(rankingData.ranked_resumes) 
        : rankingData.ranked_resumes;

      console.log("Parsed ranked_resumes data:", jsonData);

      if (!Array.isArray(jsonData)) {
        console.log("ranked_resumes is not an array:", typeof jsonData);
        return [];
      }

      console.log("Number of ranked resumes found:", jsonData.length);

      // Transform the data to match our expected format
      const rankedResumes = (jsonData as RankedResumeResponse[]).map(item => {
        console.log("Processing resume:", item.file_name);
        // Remove the % sign and convert to number
        const score = parseInt(item.overall_match_with_jd.replace('%', ''));
        console.log("Parsed score:", score);
        
        return {
          id: `${item.rank}-${item.file_name}`,
          file_name: item.file_name,
          score,
          evidence: {
            skills: [],
            experience: "",
            education: "",
            certifications: []
          }
        };
      });

      console.log("Final transformed resumes:", rankedResumes);
      return rankedResumes;
    },
    enabled: !!jobId,
  });
};