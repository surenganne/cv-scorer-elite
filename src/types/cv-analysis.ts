import type { Json } from "@/integrations/supabase/types";

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