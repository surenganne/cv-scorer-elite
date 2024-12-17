import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RankedResume {
  id: string;
  file_name: string;
  file_path?: string;
  score: number;
  matched_skills?: string[];
  experience_summary?: string;
  education_summary?: string;
  certifications?: string[];
  upload_date?: string;
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
      
      // Safely type cast the ranked_resumes JSON data
      const jsonData = data?.ranked_resumes;
      if (!jsonData || !Array.isArray(jsonData)) {
        return [];
      }

      // Type cast and validate each resume object
      const rankedResumes = jsonData.filter((item): item is RankedResume => {
        return (
          typeof item === 'object' &&
          item !== null &&
          'id' in item &&
          'file_name' in item &&
          'score' in item
        );
      });

      return rankedResumes;
    },
    enabled: !!jobId,
  });
};