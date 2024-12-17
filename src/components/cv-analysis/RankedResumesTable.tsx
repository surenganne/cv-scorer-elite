import { useState } from "react";
import { RankedResume } from "@/types/ranked-resume";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RankedResumeCard } from "./RankedResumeCard";

interface RankedResumesTableProps {
  resumes: RankedResume[];
  topN: number;
  onTopNChange: (value: number) => void;
}

export const RankedResumesTable = ({ resumes, topN, onTopNChange }: RankedResumesTableProps) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const toggleRow = (rank: number) => {
    setExpandedRows((prev) =>
      prev.includes(rank)
        ? prev.filter((r) => r !== rank)
        : [...prev, rank]
    );
  };

  const filteredResumes = resumes
    .sort((a, b) => parseInt(a.rank) - parseInt(b.rank))
    .slice(0, topN);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={topN.toString()} onValueChange={(value) => onTopNChange(parseInt(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Show top N resumes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Top 5 Resumes</SelectItem>
            <SelectItem value="10">Top 10 Resumes</SelectItem>
            <SelectItem value="15">Top 15 Resumes</SelectItem>
            <SelectItem value="20">Top 20 Resumes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Candidate</TableHead>
            <TableHead>Match Score</TableHead>
            <TableHead>Skills Match</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredResumes.map((resume) => {
            const isExpanded = expandedRows.includes(parseInt(resume.rank));
            return (
              <>
                <TableRow key={resume.rank}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(parseInt(resume.rank))}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {resume.actual_file_name || resume.file_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-base">
                      {parseFloat(resume.overall_match_with_jd).toFixed(1)}% Match
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {resume.matching_details.matching_skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50">
                          {skill}
                        </Badge>
                      ))}
                      {resume.matching_details.matching_skills.length > 3 && (
                        <Badge variant="outline">
                          +{resume.matching_details.matching_skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      View Resume
                    </Button>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-gray-50/50 p-0">
                      <div className="p-4">
                        <RankedResumeCard resume={resume} />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};