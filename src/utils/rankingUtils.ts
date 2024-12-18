import { RankedResume } from "@/types/ranked-resume";
import { Json } from "@/integrations/supabase/types";

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

interface RankingResponse {
  message: string;
  ranking: RankedResumeJson[];
}

const isValidRankedResume = (item: unknown): item is RankedResumeJson => {
  if (!item || typeof item !== "object") return false;
  
  const resume = item as Record<string, unknown>;
  
  const hasValidWeights = (weights: unknown): weights is RankedResumeJson['weights'] => {
    if (!weights || typeof weights !== 'object') return false;
    const w = weights as Record<string, unknown>;
    return (
      typeof w.skills_weight === 'string' &&
      typeof w.education_weight === 'string' &&
      typeof w.experience_weight === 'string' &&
      typeof w.certifications_weight === 'string'
    );
  };

  const hasValidMatchingDetails = (details: unknown): details is RankedResumeJson['matching_details'] => {
    if (!details || typeof details !== 'object') return false;
    const d = details as Record<string, unknown>;
    return (
      Array.isArray(d.matching_skills) &&
      Array.isArray(d.matching_education) &&
      Array.isArray(d.matching_experience) &&
      Array.isArray(d.matching_certifications) &&
      d.matching_skills.every(s => typeof s === 'string') &&
      d.matching_education.every(e => typeof e === 'string') &&
      d.matching_experience.every(e => typeof e === 'string') &&
      d.matching_certifications.every(c => typeof c === 'string')
    );
  };

  return (
    typeof resume.rank === "string" &&
    typeof resume.file_name === "string" &&
    typeof resume.overall_match_with_jd === "string" &&
    hasValidWeights(resume.weights) &&
    hasValidMatchingDetails(resume.matching_details)
  );
};

export const transformRankedResumes = (data: Json | null): RankedResume[] => {
  if (!data || typeof data !== 'object') {
    console.warn("Invalid or empty ranking data received");
    return [];
  }

  // Handle the nested structure
  const rankingData = (data as { ranking?: RankedResumeJson[] }).ranking;
  
  if (!Array.isArray(rankingData)) {
    console.warn("No ranking array found in the data");
    return [];
  }

  return rankingData
    .map(item => {
      if (!isValidRankedResume(item)) {
        console.warn("Invalid resume data structure:", item);
        return null;
      }
      return {
        rank: item.rank,
        weights: item.weights,
        file_name: item.file_name,
        matching_details: item.matching_details,
        overall_match_with_jd: item.overall_match_with_jd.replace('%', '') // Remove '%' if present
      };
    })
    .filter((item): item is RankedResume => item !== null);
};