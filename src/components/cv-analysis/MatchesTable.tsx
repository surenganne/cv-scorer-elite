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
    <div className="mt-8 space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          Top {matches.length} Matches
          <span className="text-sm font-normal text-gray-500">
            for {jobTitle}
          </span>
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Candidate</TableHead>
                <TableHead className="font-semibold">Match Analysis</TableHead>
                <TableHead className="font-semibold">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow 
                  key={match.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {match.file_name}
                  </TableCell>
                  <TableCell className="max-w-2xl">
                    <MatchEvidence score={match.score} evidence={match.evidence} weights={weights} />
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {format(new Date(match.upload_date), "MMM dd, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};