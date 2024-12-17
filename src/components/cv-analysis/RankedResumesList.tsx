import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy } from "lucide-react";

interface RankedResume {
  rank: string;
  file_name: string;
  overall_match_with_jd: string;
  weights: {
    skills_weight: string;
    education_weight: string;
    experience_weight: string;
    certifications_weight: string;
  };
  matching_details?: {
    matching_skills: string[];
    matching_education: string[];
    matching_experience: string[];
    matching_certifications: string[];
  };
}

interface RankedResumesListProps {
  resumes: RankedResume[];
}

export const RankedResumesList = ({ resumes }: RankedResumesListProps) => {
  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Top {resumes.length} Matches
        </h3>
        
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Rank</TableHead>
                <TableHead className="font-semibold">File Name</TableHead>
                <TableHead className="font-semibold">Match Score</TableHead>
                <TableHead className="font-semibold">Skills</TableHead>
                <TableHead className="font-semibold">Education</TableHead>
                <TableHead className="font-semibold">Experience</TableHead>
                <TableHead className="font-semibold">Certifications</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resumes.map((resume) => (
                <TableRow key={resume.rank} className="hover:bg-muted/50">
                  <TableCell className="font-medium">#{resume.rank}</TableCell>
                  <TableCell>{resume.file_name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      {resume.overall_match_with_jd}
                    </span>
                  </TableCell>
                  <TableCell>{resume.weights.skills_weight}%</TableCell>
                  <TableCell>{resume.weights.education_weight}%</TableCell>
                  <TableCell>{resume.weights.experience_weight}%</TableCell>
                  <TableCell>{resume.weights.certifications_weight}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};