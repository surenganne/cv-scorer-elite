import React, { useState } from "react";
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
import { ChevronDown, ChevronRight, FileText, Trophy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RankedResumeCard } from "./RankedResumeCard";
import { useCVOperations } from "@/hooks/useCVOperations";

interface RankedResumesTableProps {
  resumes: RankedResume[];
  topN: number;
  onTopNChange: (value: number) => void;
}

export const RankedResumesTable = ({ resumes, topN, onTopNChange }: RankedResumesTableProps) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const { handleViewCV } = useCVOperations();

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
      <div className="flex justify-end mb-6">
        <Select value={topN.toString()} onValueChange={(value) => onTopNChange(parseInt(value))}>
          <SelectTrigger className="w-[180px] bg-white shadow-sm hover:bg-gray-50/50 transition-colors">
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/70 transition-colors">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[100px] font-semibold text-gray-700">Rank</TableHead>
              <TableHead className="font-semibold text-gray-700">Candidate</TableHead>
              <TableHead className="font-semibold text-gray-700">Match Score</TableHead>
              <TableHead className="font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResumes.map((resume) => {
              const isExpanded = expandedRows.includes(parseInt(resume.rank));
              return (
                <React.Fragment key={resume.rank}>
                  <TableRow className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(parseInt(resume.rank))}
                        className="hover:bg-gray-100/80"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-gray-700">#{resume.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {resume.actual_file_name}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className="text-base bg-gradient-to-r from-purple-50 to-blue-50 text-gray-700 border border-purple-100"
                      >
                        {resume.overall_match_with_jd}% Match
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 hover:bg-purple-50/50 hover:border-purple-200 transition-colors"
                        onClick={() => handleViewCV(resume.file_name)}
                      >
                        <FileText className="h-4 w-4 text-purple-500" />
                        View Resume
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-gradient-to-r from-purple-50/30 to-blue-50/30 p-0">
                        <div className="p-6">
                          <RankedResumeCard resume={resume} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};