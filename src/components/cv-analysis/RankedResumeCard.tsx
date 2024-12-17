import { RankedResume } from "@/types/ranked-resume";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Code, Briefcase, GraduationCap, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface RankedResumeCardProps {
  resume: RankedResume;
}

export const RankedResumeCard = ({ resume }: RankedResumeCardProps) => {
  const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b'];

  const jobWeights = [
    { name: 'Skills', value: parseInt(resume.weights.skills_weight), icon: <Code className="h-3.5 w-3.5 text-blue-500" /> },
    { name: 'Experience', value: parseInt(resume.weights.experience_weight), icon: <Briefcase className="h-3.5 w-3.5 text-purple-500" /> },
    { name: 'Education', value: parseInt(resume.weights.education_weight), icon: <GraduationCap className="h-3.5 w-3.5 text-green-500" /> },
    { name: 'Certifications', value: parseInt(resume.weights.certifications_weight), icon: <Award className="h-3.5 w-3.5 text-amber-500" /> }
  ];

  return (
    <Card className="bg-white">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">
              Rank #{resume.rank}
            </h3>
          </div>
          <Badge variant="secondary" className="text-base bg-gradient-to-r from-purple-50 to-blue-50 text-gray-700 border border-purple-100">
            {resume.overall_match_with_jd}% Match
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_200px] gap-4 items-center">
            <div className="space-y-2">
              {jobWeights.map((weight, index) => (
                <div key={weight.name} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      {weight.icon}
                      <span className="font-medium">{weight.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 ml-5">Weight: {weight.value}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobWeights}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {jobWeights.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem',
                      padding: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
              <Code className="h-3.5 w-3.5 text-blue-500" />
              Matching Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {resume.matching_details.matching_skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
              <Briefcase className="h-3.5 w-3.5 text-purple-500" />
              Experience
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {resume.matching_details.matching_experience.map((exp, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 hover:bg-purple-100"
                >
                  {exp}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
              <GraduationCap className="h-3.5 w-3.5 text-green-500" />
              Education
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {resume.matching_details.matching_education.map((edu, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-green-50 text-green-700 hover:bg-green-100"
                >
                  {edu}
                </Badge>
              ))}
            </div>
          </div>

          {resume.matching_details.matching_certifications.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                Certifications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {resume.matching_details.matching_certifications.map((cert, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-amber-50 text-amber-700 hover:bg-amber-100"
                  >
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};