import { useRankedResumes } from "@/hooks/useRankedResumes";
import { MatchesTable } from "./MatchesTable";
import { useCVOperations } from "@/hooks/useCVOperations";

interface JobMatchesProps {
  jobId: string;
  jobTitle: string;
  weights: {
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
    certifications_weight: number;
  };
}

export const JobMatches = ({ jobId, jobTitle, weights }: JobMatchesProps) => {
  const { handleViewCV } = useCVOperations();
  const { data: rankedResumes, isLoading } = useRankedResumes(jobId);

  console.log("JobMatches component rendered with jobId:", jobId);
  console.log("JobMatches received rankedResumes:", rankedResumes);
  console.log("JobMatches isLoading:", isLoading);

  if (isLoading) {
    return <div>Loading matches...</div>;
  }

  // Transform the ranked resumes data to match the expected format
  const matches = (Array.isArray(rankedResumes) ? rankedResumes : []).map((match) => ({
    id: match.rank,
    file_name: match.file_name,
    score: parseInt(match.overall_match_with_jd),
    upload_date: new Date().toISOString(),
    evidence: {
      skills: [],
      experience: `Match score: ${match.overall_match_with_jd}`,
      education: `Weights: Skills ${match.weights.skills_weight}%, Education ${match.weights.education_weight}%, Experience ${match.weights.experience_weight}%, Certifications ${match.weights.certifications_weight}%`,
      certifications: [],
    },
  }));

  console.log("JobMatches filtered matches:", matches);

  if (!matches.length) {
    return null;
  }

  return (
    <MatchesTable
      matches={matches}
      jobTitle={jobTitle}
      weights={weights}
      onViewResume={handleViewCV}
    />
  );
};