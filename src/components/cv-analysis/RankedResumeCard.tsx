import { RankedResume } from "@/types/ranked-resume";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Code, GraduationCap, Briefcase, Award } from "lucide-react";

interface RankedResumeCardProps {
  resume: RankedResume;
}

export const RankedResumeCard = ({ resume }: RankedResumeCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Rank #{resume.rank}
          </CardTitle>
          <Badge variant="secondary" className="text-lg">
            {resume.overall_match_with_jd} Match
          </Badge>
        </div>
        <CardDescription>{resume.file_name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Code className="h-4 w-4 text-blue-500" />
            Skills
          </div>
          <div className="flex flex-wrap gap-1">
            {resume.matching_details.matching_skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <GraduationCap className="h-4 w-4 text-green-500" />
            Education
          </div>
          <div className="flex flex-wrap gap-1">
            {resume.matching_details.matching_education.map((edu, index) => (
              <Badge key={index} variant="outline" className="bg-green-50">
                {edu}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Briefcase className="h-4 w-4 text-purple-500" />
            Experience
          </div>
          <div className="flex flex-col gap-1">
            {resume.matching_details.matching_experience.map((exp, index) => (
              <span key={index} className="text-sm text-gray-600">
                • {exp}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Award className="h-4 w-4 text-amber-500" />
            Certifications
          </div>
          <div className="flex flex-wrap gap-1">
            {resume.matching_details.matching_certifications.map((cert, index) => (
              <Badge key={index} variant="outline" className="bg-amber-50">
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};