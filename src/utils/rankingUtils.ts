import { RankedResume } from "@/types/ranked-resume";
import { Json } from "@/integrations/supabase/types";

export const isValidRankedResume = (item: Json): item is RankedResume => {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as any).rank === "string" &&
    typeof (item as any).file_name === "string" &&
    typeof (item as any).overall_match_with_jd === "string" &&
    typeof (item as any).weights === "object" &&
    (item as any).weights !== null &&
    typeof (item as any).matching_details === "object" &&
    (item as any).matching_details !== null
  );
};

export const transformRankedResumes = (rawRankedResumes: Json[] | null): RankedResume[] => {
  if (!Array.isArray(rawRankedResumes)) {
    return [];
  }
  return rawRankedResumes.filter(isValidRankedResume);
};