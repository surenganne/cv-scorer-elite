import { RankedResume } from "@/types/ranked-resume";
import { Json } from "@/integrations/supabase/types";

// Interface to match the structure we receive from the API
interface RankedResumeJson {
  rank: string;
  weights: {
    skills_weight: string;
    education_weight: string;
    experience_weight: string;
    certifications_weight: string;
  };
  file_name: string;
  matching_details: {
    matching_skills: string[];
    matching_education: string[];
    matching_experience: string[];
    matching_certifications: string[];
  };
  overall_match_with_jd: string;
}

// Type guard to ensure the data matches our expected structure
const isValidRankedResume = (item: any): item is RankedResumeJson => {
  if (!item || typeof item !== "object") return false;
  
  return (
    typeof item.rank === "string" &&
    typeof item.file_name === "string" &&
    typeof item.overall_match_with_jd === "string" &&
    typeof item.weights === "object" &&
    item.weights !== null &&
    typeof item.matching_details === "object" &&
    item.matching_details !== null &&
    Array.isArray(item.matching_details.matching_skills) &&
    Array.isArray(item.matching_details.matching_education) &&
    Array.isArray(item.matching_details.matching_experience) &&
    Array.isArray(item.matching_details.matching_certifications)
  );
};

export const transformRankedResumes = (data: Json | null): RankedResume[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item): item is any => isValidRankedResume(item))
    .map(resume => {
      // Create a new object with the correct type structure
      const transformedResume: RankedResume = {
        rank: resume.rank,
        weights: resume.weights,
        file_name: resume.file_name,
        matching_details: resume.matching_details,
        overall_match_with_jd: resume.overall_match_with_jd
      };
      return transformedResume;
    });
};