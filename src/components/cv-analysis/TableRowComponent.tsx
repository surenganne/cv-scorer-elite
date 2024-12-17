import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Loader2, Users } from "lucide-react";
import { format } from "date-fns";

interface JobTableRowProps {
  job: {
    id: string;
    title: string;
    minimum_experience: number;
    created_at: string;
  };
  onFindMatches: (id: string) => void;
  isLoading: boolean;
}

interface MatchTableRowProps {
  match: {
    id: string;
    file_name: string;
    upload_date: string;
    score: number;
    file_path?: string;
    evidence: {
      skills: string[];
      experience: string;
      education: string;
      certifications: string[];
    };
  };
  isSelected: boolean;
  onSelect: (candidateId: string) => void;
  expandedMatch: string | null;
  onToggleExpand: (id: string) => void;
  onViewResume?: (filePath: string) => Promise<void>;
  weights?: {
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
    certifications_weight: number;
  };
}

export type TableRowProps = JobTableRowProps | MatchTableRowProps;

export const TableRowComponent = (props: TableRowProps) => {
  // Check if this is a job row
  if ('job' in props) {
    const { job, onFindMatches, isLoading } = props;
    return (
      <TableRow key={job.id}>
        <TableCell className="font-medium">{job.title}</TableCell>
        <TableCell>{job.minimum_experience} years</TableCell>
        <TableCell>
          {format(new Date(job.created_at), "MMM dd, yyyy")}
        </TableCell>
        <TableCell>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFindMatches(job.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            Find Matched Jobseekers
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  // This is a match row
  const { match, isSelected, onSelect, expandedMatch, onToggleExpand, onViewResume, weights } = props;
  return (
    <TableRow key={match.id}>
      <TableCell>
        {/* Implement match row UI here */}
        {match.file_name}
      </TableCell>
      {/* Add other cells based on your match display requirements */}
    </TableRow>
  );
};