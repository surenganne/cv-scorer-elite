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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RankedResumesTableProps {
  resumes: RankedResume[];
}

export const RankedResumesTable = ({ resumes }: RankedResumesTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [topN, setTopN] = useState<number>(10);

  const toggleRow = (rank: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(rank)) {
      newExpandedRows.delete(rank);
    } else {
      newExpandedRows.add(rank);
    }
    setExpandedRows(newExpandedRows);
  };

  // Sort resumes by rank (converted to number) and slice to get top N
  const filteredResumes = [...resumes]
    .sort((a, b) => parseInt(a.rank) - parseInt(b.rank))
    .slice(0, topN);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          value={topN.toString()}
          onValueChange={(value) => setTopN(parseInt(value))}
        >
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResumes.map((resume) => (
              <>
                <TableRow key={resume.rank}>
                  <TableCell className="font-medium">#{parseInt(resume.rank)}</TableCell>
                  <TableCell>{resume.actual_file_name || resume.file_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {parseFloat(resume.overall_match_with_jd).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(parseInt(resume.rank))}
                    >
                      {expandedRows.has(parseInt(resume.rank)) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.has(parseInt(resume.rank)) && (
                  <TableRow>
                    <TableCell colSpan={4} className="bg-muted/50">
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {resume.matching_details.matching_skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Education</h4>
                          <div className="flex flex-wrap gap-1">
                            {resume.matching_details.matching_education.map((edu, index) => (
                              <Badge key={index} variant="outline" className="bg-green-50">
                                {edu}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Experience</h4>
                          <div className="space-y-1">
                            {resume.matching_details.matching_experience.map((exp, index) => (
                              <p key={index} className="text-sm text-gray-600">
                                • {exp}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Certifications</h4>
                          <div className="flex flex-wrap gap-1">
                            {resume.matching_details.matching_certifications.map((cert, index) => (
                              <Badge key={index} variant="outline" className="bg-amber-50">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};