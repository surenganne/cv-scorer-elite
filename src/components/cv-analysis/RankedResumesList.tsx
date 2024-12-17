import { RankedResume } from "@/hooks/useRankedResumes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FileText, GraduationCap, Briefcase, Award } from "lucide-react";

interface RankedResumesListProps {
  resumes: RankedResume[];
  isLoading: boolean;
}

export const RankedResumesList = ({ resumes, isLoading }: RankedResumesListProps) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading matches...</div>;
  }

  if (!resumes?.length) {
    return <div className="text-center py-4">No matches found.</div>;
  }

  const getBadgeVariant = (score: string) => {
    const numericScore = parseInt(score);
    if (numericScore >= 80) return "default";
    if (numericScore >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Match Score</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resumes.map((resume) => (
            <TableRow key={`${resume.file_name}-${resume.rank}`}>
              <TableCell className="font-medium">#{resume.rank}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  {resume.file_name}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getBadgeVariant(resume.overall_match_with_jd)}
                >
                  {resume.overall_match_with_jd}
                </Badge>
              </TableCell>
              <TableCell>
                <Accordion type="single" collapsible>
                  <AccordionItem value="details">
                    <AccordionTrigger>View Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4">
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Matching Skills
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resume.matching_details.matching_skills.map((skill) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-green-500" />
                            Education
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resume.matching_details.matching_education.map((edu) => (
                              <Badge key={edu} variant="outline" className="bg-green-50">
                                {edu}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-purple-500" />
                            Experience
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resume.matching_details.matching_experience.map((exp) => (
                              <Badge key={exp} variant="outline" className="bg-purple-50">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Award className="h-4 w-4 text-amber-500" />
                            Certifications
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resume.matching_details.matching_certifications.map((cert) => (
                              <Badge key={cert} variant="outline" className="bg-amber-50">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};