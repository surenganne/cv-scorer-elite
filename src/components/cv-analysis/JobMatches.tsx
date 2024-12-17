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
  const { data: rankedResumes, isLoading, error } = useRankedResumes(jobId);

  console.log("JobMatches render state:", {
    jobId,
    rankedResumes,
    isLoading,
    error,
    weights
  });

  if (error) {
    console.error("Error in JobMatches:", error);
    return <div>Error loading matches: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading matches...</div>;
  }

  // Transform the ranked resumes data to match the expected format
  const matches = (Array.isArray(rankedResumes) ? rankedResumes : []).map((match) => {
    const transformedMatch = {
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
    };
    console.log("Transformed match:", transformedMatch);
    return transformedMatch;
  });

  console.log("Final matches array:", matches);

  if (!matches.length) {
    return <div>No matches found for this job.</div>;
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