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
      // Don't make the API call if no jobId is provided
      if (!jobId) {
        return [];
      }

      console.log("Starting fetch for job ID:", jobId);
      
      const { data, error } = await supabase
        .from("edb-cv-ranking")
        .select("ranked_resumes")
        .eq("job_id", jobId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results case

      console.log("Raw Supabase response:", { data, error });

      if (error) {
        console.error("Error fetching ranked resumes:", error);
        throw error;
      }

      if (!data?.ranked_resumes) {
        console.log("No ranked resumes data found");
        return [];
      }

      try {
        const parsedResumes = JSON.parse(data.ranked_resumes as string) as RankedResume[];
        return parsedResumes.slice(0, 10); // Only return top 10 results
      } catch (e) {
        console.error("Error parsing ranked resumes:", e);
        return [];
      }
    },
    enabled: Boolean(jobId), // Only run the query if jobId is provided
  });
};