import { Json } from "@/integrations/supabase/types";

export interface RankedResume {
  rank: string;
  file_name: string;
  overall_match_with_jd: string;
  weights: {
    skills_weight: string;
    education_weight: string;
    experience_weight: string;
    certifications_weight: string;
  };
  matching_details?: {
    matching_skills: string[];
    matching_education: string[];
    matching_experience: string[];
    matching_certifications: string[];
  };
}

export function isRankedResume(json: unknown): json is RankedResume {
  if (!json || typeof json !== 'object') return false;
  
  const resume = json as Record<string, unknown>;
  const weights = resume.weights as Record<string, unknown>;
  
  return (
    typeof resume.rank === 'string' &&
    typeof resume.file_name === 'string' &&
    typeof resume.overall_match_with_jd === 'string' &&
    weights !== null &&
    typeof weights === 'object' &&
    typeof weights.skills_weight === 'string' &&
    typeof weights.education_weight === 'string' &&
    typeof weights.experience_weight === 'string' &&
    typeof weights.certifications_weight === 'string'
  );
}