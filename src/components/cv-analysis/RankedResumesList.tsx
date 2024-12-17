import { RankedResume } from "@/types/ranked-resume";
import { RankedResumeCard } from "./RankedResumeCard";

interface RankedResumesListProps {
  resumes: RankedResume[];
}

export const RankedResumesList = ({ resumes }: RankedResumesListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {resumes.map((resume, index) => (
        <RankedResumeCard key={index} resume={resume} />
      ))}
    </div>
  );
};