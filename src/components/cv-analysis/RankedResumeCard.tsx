import { RankedResume } from "@/types/ranked-resume";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, GraduationCap, Briefcase, Award } from "lucide-react";

interface RankedResumeCardProps {
  resume: RankedResume;
}

export const RankedResumeCard = ({ resume }: RankedResumeCardProps) => {
  return (
    <Card className="w-full bg-white shadow-sm border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {resume.actual_file_name || resume.file_name}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="text-lg bg-gradient-to-r from-purple-50 to-blue-50 text-gray-700 border border-purple-100"
          >
            {resume.overall_match_with_jd}% Match
          </Badge>
        </div>
        <CardDescription className="text-sm font-medium text-gray-600">
          Candidate Details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Code className="h-4 w-4 text-blue-500" />
            Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.matching_details.matching_skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-blue-50/50 border-blue-200 text-gray-700 hover:bg-blue-100/50 transition-colors"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <GraduationCap className="h-4 w-4 text-green-500" />
            Education
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.matching_details.matching_education.map((edu, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-green-50/50 border-green-200 text-gray-700 hover:bg-green-100/50 transition-colors"
              >
                {edu}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Briefcase className="h-4 w-4 text-purple-500" />
            Experience
          </div>
          <div className="flex flex-col gap-2">
            {resume.matching_details.matching_experience.map((exp, index) => (
              <span key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-purple-100">
                {exp}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Award className="h-4 w-4 text-amber-500" />
            Certifications
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.matching_details.matching_certifications.map((cert, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-amber-50/50 border-amber-200 text-gray-700 hover:bg-amber-100/50 transition-colors"
              >
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
