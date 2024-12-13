import { useState } from "react";
import { MatchEvidence } from "./MatchEvidence";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          Top {matches.length} Matches
          <span className="text-sm font-normal text-gray-500">
            for {jobTitle}
          </span>
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold py-2">Candidate</TableHead>
                <TableHead className="font-semibold py-2">Match Analysis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow 
                  key={match.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="font-medium py-2">
                    {match.file_name}
                  </TableCell>
                  <TableCell className="max-w-2xl py-2">
                    <MatchEvidence 
                      score={match.score} 
                      evidence={match.evidence} 
                      weights={weights}
                      isExpanded={expandedMatch === match.id}
                      onToggle={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                    />
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