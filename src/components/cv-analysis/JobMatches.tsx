import { useState } from "react";
import { useRankedResumes } from "@/hooks/useRankedResumes";
import { MatchesTable } from "./MatchesTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobMatchesProps {
  jobId: string;
  jobTitle: string;
  weights: {
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
    certifications_weight: number;
  };
  onViewResume: (filePath: string) => Promise<void>;
}

export const JobMatches = ({ jobId, jobTitle, weights, onViewResume }: JobMatchesProps) => {
  console.log("JobMatches component rendered with jobId:", jobId);
  const [topMatches, setTopMatches] = useState(5);
  const { data: rankedResumes, isLoading } = useRankedResumes(jobId);

  console.log("JobMatches received rankedResumes:", rankedResumes);
  console.log("JobMatches isLoading:", isLoading);

  if (isLoading) {
    console.log("JobMatches is in loading state");
    return <div className="text-center py-4">Loading matches...</div>;
  }

  if (!rankedResumes || !Array.isArray(rankedResumes)) {
    console.log("No valid ranked resumes data:", rankedResumes);
    return <div className="text-center py-4">No matches found.</div>;
  }

  const matches = rankedResumes
    .slice(0, topMatches)
    .map((match) => ({
      id: match.id,
      file_name: match.file_name,
      score: match.score,
      evidence: match.evidence,
      upload_date: new Date().toISOString() // Default date for now
    }));

  console.log("JobMatches filtered matches:", matches);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Show:</span>
        <Select
          value={String(topMatches)}
          onValueChange={(value) => setTopMatches(Number(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Top 5" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Top 5</SelectItem>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="15">Top 15</SelectItem>
            <SelectItem value="20">Top 20</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <MatchesTable 
        matches={matches} 
        jobTitle={jobTitle} 
        weights={weights}
        onViewResume={onViewResume}
      />
    </div>
  );
};