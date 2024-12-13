import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MatchEvidence } from "./MatchEvidence";

interface Match {
  id: string;
  file_name: string;
  upload_date: string;
  score: number;
  evidence: {
    skills: string[];
    experience: string;
    education: string;
    certifications: string[];
  };
}

interface MatchesTableProps {
  matches: Match[];
  jobTitle: string;
  weights?: {
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
    certifications_weight: number;
  };
}

export const MatchesTable = ({ matches, jobTitle, weights }: MatchesTableProps) => {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold">
        Top {matches.length} Matches for: {jobTitle}
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Match Details</TableHead>
            <TableHead>Upload Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id}>
              <TableCell>{match.file_name}</TableCell>
              <TableCell className="max-w-xl">
                <MatchEvidence score={match.score} evidence={match.evidence} weights={weights} />
              </TableCell>
              <TableCell>
                {format(new Date(match.upload_date), "MMM dd, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};