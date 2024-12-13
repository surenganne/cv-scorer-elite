import { useState } from "react";
import { MatchEvidence } from "./MatchEvidence";
import { CandidateSelection } from "./CandidateSelection";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface Match {
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

  const handleViewResume = async (filePath: string) => {
    try {
      if (!filePath) {
        throw new Error("Invalid file path");
      }

      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(filePath, 3600);

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error("No signed URL returned");
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error viewing resume:", error);
    }
  };

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          Top {matches.length} Matches
          <span className="text-sm font-normal text-gray-500">
            for {jobTitle}
          </span>
        </h3>
        <CandidateSelection matches={matches} jobTitle={jobTitle} />
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white mt-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold py-2 text-left">Candidate</TableHead>
                <TableHead className="font-semibold py-2">Match Analysis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow 
                  key={match.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="font-medium py-2 text-left">
                    <div className="flex flex-col gap-2">
                      <span>{match.file_name}</span>
                      {match.file_path && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-fit"
                          onClick={() => handleViewResume(match.file_path!)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Resume
                        </Button>
                      )}
                    </div>
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