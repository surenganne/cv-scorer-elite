import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      
      const { data: cvRankings, error } = await supabase
        .from("edb-cv-ranking")
        .select("*")
        .eq("job_id", jobId);

      if (error) {
        console.error("Error fetching ranked resumes:", error);
        throw error;
      }

      console.log("Raw CV rankings data:", cvRankings);

      // If no rankings found, return empty array
      if (!cvRankings || cvRankings.length === 0) {
        console.log("No rankings found for job ID:", jobId);
        return [];
      }

      // Get the first ranking entry (should be the most recent)
      const rankingData = cvRankings[0];
      
      if (!rankingData.ranked_resumes) {
        console.log("No ranked_resumes field in the data");
        return [];
      }

      let rankedResumesData;
      try {
        // Parse the ranked_resumes if it's a string
        rankedResumesData = typeof rankingData.ranked_resumes === 'string' 
          ? JSON.parse(rankingData.ranked_resumes) 
          : rankingData.ranked_resumes;

        console.log("Parsed ranked_resumes data:", rankedResumesData);
      } catch (e) {
        console.error("Error parsing ranked_resumes:", e);
        return [];
      }

      if (!Array.isArray(rankedResumesData)) {
        console.log("ranked_resumes is not an array");
        return [];
      }

      // Transform the data
      const rankedResumes = rankedResumesData.map((item: RankedResumeResponse) => {
        // Remove the % sign and convert to number
        const score = parseFloat(item.overall_match_with_jd.replace('%', ''));
        
        return {
          id: `${item.rank}-${item.file_name}`,
          file_name: item.file_name,
          score: isNaN(score) ? 0 : score,
          evidence: {
            skills: [],  // These could be populated if available in the response
            experience: "",
            education: "",
            certifications: []
          }
        };
      });

      console.log("Transformed ranked resumes:", rankedResumes);
      return rankedResumes;
    },
    enabled: !!jobId,
  });
};