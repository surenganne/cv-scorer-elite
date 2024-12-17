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
import { Trophy, Code, GraduationCap, Briefcase, Award } from "lucide-react";

interface RankedResumesListProps {
  resumes: RankedResume[];
  topN: number;
}

export const RankedResumesList = ({ resumes, topN }: RankedResumesListProps) => {
  const displayedResumes = resumes.slice(0, topN);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Match Score</TableHead>
            <TableHead>Skills</TableHead>
            <TableHead>Education</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Certifications</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedResumes.map((resume, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  #{resume.rank}
                </div>
              </TableCell>
              <TableCell>{resume.actual_file_name || resume.file_name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{resume.overall_match_with_jd}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {resume.matching_details.matching_skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {resume.matching_details.matching_education.map((edu, idx) => (
                    <Badge key={idx} variant="outline" className="bg-green-50">
                      {edu}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 max-w-[200px]">
                  {resume.matching_details.matching_experience.map((exp, idx) => (
                    <span key={idx} className="text-sm text-gray-600 truncate">
                      • {exp}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {resume.matching_details.matching_certifications.map((cert, idx) => (
                    <Badge key={idx} variant="outline" className="bg-amber-50">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};