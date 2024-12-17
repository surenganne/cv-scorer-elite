import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Award, GraduationCap, Briefcase, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RankedResume {
  rank: string;
  weights: {
    skills_weight: string;
    education_weight: string;
    experience_weight: string;
    certifications_weight: string;
  };
  file_name: string;
  matching_details: {
    matching_skills: string[];
    matching_education: string[];
    matching_experience: string[];
    matching_certifications: string[];
  };
  overall_match_with_jd: string;
}

interface RankedResumesListProps {
  data: RankedResume[];
  onViewResume?: (fileName: string) => void;
}

export const RankedResumesList = ({ data, onViewResume }: RankedResumesListProps) => {
  const getScoreColor = (score: string) => {
    const numericScore = parseInt(score);
    if (numericScore >= 80) return "text-emerald-600 bg-emerald-50";
    if (numericScore >= 60) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>Candidate Details</TableHead>
            <TableHead className="w-[150px] text-right">Match Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((resume) => (
            <TableRow key={`${resume.file_name}-${resume.rank}`}>
              <TableCell className="font-medium">#{resume.rank}</TableCell>
              <TableCell>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{resume.file_name}</span>
                    {onViewResume && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewResume(resume.file_name)}
                      >
                        View Resume
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-2 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Code className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Skills</span>
                        <span className="text-gray-500 text-xs">
                          (Weight: {resume.weights.skills_weight}%)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {resume.matching_details.matching_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Experience</span>
                        <span className="text-gray-500 text-xs">
                          (Weight: {resume.weights.experience_weight}%)
                        </span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {resume.matching_details.matching_experience.map((exp, idx) => (
                          <li key={idx}>{exp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Education</span>
                        <span className="text-gray-500 text-xs">
                          (Weight: {resume.weights.education_weight}%)
                        </span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {resume.matching_details.matching_education.map((edu, idx) => (
                          <li key={idx}>{edu}</li>
                        ))}
                      </ul>
                    </div>

                    {resume.matching_details.matching_certifications.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">Certifications</span>
                          <span className="text-gray-500 text-xs">
                            (Weight: {resume.weights.certifications_weight}%)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {resume.matching_details.matching_certifications.map((cert, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium",
                    getScoreColor(resume.overall_match_with_jd)
                  )}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  {resume.overall_match_with_jd}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};