import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { MatchEvidence } from "./MatchEvidence";

interface TableRowProps {
  match: {
    id: string;
    file_name: string;
    file_path?: string;
    score: number;
    evidence: {
      skills: string[];
      experience: string;
      education: string;
      certifications: string[];
    };
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
  expandedMatch: string | null;
  onToggleExpand: (id: string) => void;
  onViewResume: (path: string) => void;
  weights?: {
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
    certifications_weight: number;
  };
}

export const TableRowComponent = ({
  match,
  isSelected,
  onSelect,
  expandedMatch,
  onToggleExpand,
  onViewResume,
  weights,
}: TableRowProps) => {
  return (
    <TableRow className="hover:bg-gray-50/50 transition-colors">
      <TableCell className="w-[50px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(match.id)}
        />
      </TableCell>
      <TableCell className="font-medium py-2 text-left">
        <div className="flex flex-col gap-2">
          <span>{match.file_name}</span>
          {match.file_path && (
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => onViewResume(match.file_path!)}
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
          onToggle={() => onToggleExpand(match.id)}
        />
      </TableCell>
    </TableRow>
  );
};