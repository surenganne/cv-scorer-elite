import React, { useState } from "react";
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
import { ChevronDown, ChevronRight, FileText, Trophy, CheckSquare, Square } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RankedResumeCard } from "./RankedResumeCard";
import { useCVOperations } from "@/hooks/useCVOperations";
import { Checkbox } from "@/components/ui/checkbox";
import { EmailCandidates } from "./EmailCandidates";

interface RankedResume {
  rank: string;
  file_name: string;
  actual_file_name?: string;
  overall_match_with_jd: string;
  weights: {
    skills_weight: string;
    education_weight: string;
    experience_weight: string;
    certifications_weight: string;
  };
  matching_details: {
    matching_skills: string[];
    matching_education: string[];
    matching_experience: string[];
    matching_certifications: string[];
  };
}

interface RankedResumesTableProps {
  resumes: RankedResume[];
  topN: number;
  onTopNChange: (value: number) => void;
}

export const RankedResumesTable = ({ resumes, topN, onTopNChange }: RankedResumesTableProps) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const { handleViewCV } = useCVOperations();
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const toggleRow = (rank: number) => {
    setExpandedRows((prev) =>
      prev.includes(rank)
        ? prev.filter((r) => r !== rank)
        : [...prev, rank]
    );
  };

  const toggleSelectResume = (fileName: string) => {
    setSelectedResumes(prev => 
      prev.includes(fileName)
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  const toggleSelectAll = () => {
    if (selectedResumes.length === filteredResumes.length) {
      setSelectedResumes([]);
    } else {
      setSelectedResumes(filteredResumes.map(resume => resume.file_name));
    }
  };

  const filteredResumes = resumes
    .sort((a, b) => parseInt(a.rank) - parseInt(b.rank))
    .slice(0, topN);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
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
        {selectedResumes.length > 0 && (
          <Button 
            variant="outline"
            onClick={() => setShowEmailDialog(true)}
            className="gap-2"
          >
            Email Selected Candidates ({selectedResumes.length})
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/70 transition-colors">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedResumes.length === filteredResumes.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all candidates"
                />
              </TableHead>
              <TableHead className="w-[100px] font-semibold text-gray-700">Rank</TableHead>
              <TableHead className="font-semibold text-gray-700">Candidate</TableHead>
              <TableHead className="font-semibold text-gray-700">Match Score</TableHead>
              <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResumes.map((resume) => {
              const isExpanded = expandedRows.includes(parseInt(resume.rank));
              const isSelected = selectedResumes.includes(resume.file_name);
              return (
                <React.Fragment key={resume.rank}>
                  <TableRow className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectResume(resume.file_name)}
                        aria-label={`Select ${resume.actual_file_name || resume.file_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-gray-700">#{resume.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {resume.actual_file_name || resume.file_name}
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
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gradient-to-r from-purple-50/30 to-blue-50/30 p-0">
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

      {showEmailDialog && (
        <EmailCandidates
          selectedCandidates={selectedResumes}
          onClose={() => setShowEmailDialog(false)}
        />
      )}
    </div>
  );
};