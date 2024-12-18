import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { EmailCandidates } from "./EmailCandidates";
import { TableHeaderComponent } from "./TableHeader";
import { TableRowComponent } from "./TableRowComponent";

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
  onViewResume?: (filePath: string) => Promise<void>;
}

export const MatchesTable = ({ matches, jobTitle, weights, onViewResume }: MatchesTableProps) => {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const handleViewResume = async (filePath: string) => {
    if (onViewResume) {
      await onViewResume(filePath);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCandidateIds(checked ? matches.map(match => match.id) : []);
  };

  const handleCheckboxChange = (candidateId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const selectedCandidates = matches.filter(match => 
    selectedCandidateIds.includes(match.id)
  );

  const allSelected = matches.length > 0 && selectedCandidateIds.length === matches.length;

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          Top {matches.length} Matches
          <span className="text-sm font-normal text-gray-500">
            for {jobTitle}
          </span>
        </h3>
        
        <EmailCandidates
          selectedCandidates={selectedCandidates}
          matches={matches}
          jobTitle={jobTitle}
          onEmailsSent={() => setSelectedCandidateIds([])}
        />

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeaderComponent
              onSelectAll={handleSelectAll}
              allSelected={allSelected}
            />
            <TableBody>
              {matches.map((match) => (
                <TableRowComponent
                  key={match.id}
                  match={match}
                  isSelected={selectedCandidateIds.includes(match.id)}
                  onSelect={handleCheckboxChange}
                  expandedMatch={expandedMatch}
                  onToggleExpand={(id) => setExpandedMatch(expandedMatch === id ? null : id)}
                  onViewResume={handleViewResume}
                  weights={weights}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};