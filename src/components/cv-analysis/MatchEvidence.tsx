import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trophy, Award, GraduationCap, Briefcase, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface MatchEvidenceProps {
  score: number;
  evidence: {
    skills: string[];
    experience: string;
    education: string;
    certifications: string[];
  };
  weights?: {
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
    certifications_weight: number;
  };
}

export const MatchEvidence = ({ score, evidence, weights }: MatchEvidenceProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  const getBorderColor = (score: number) => {
    if (score >= 80) return "border-emerald-200";
    if (score >= 60) return "border-amber-200";
    return "border-rose-200";
  };

  const mockScores = {
    skills: Math.round(score * (weights?.skills_weight || 25) / 100),
    experience: Math.round(score * (weights?.experience_weight || 25) / 100),
    education: Math.round(score * (weights?.education_weight || 25) / 100),
    certifications: Math.round(score * (weights?.certifications_weight || 25) / 100),
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b'];

  const pieData = weights ? [
    { name: 'Skills', value: mockScores.skills, weight: weights.skills_weight },
    { name: 'Experience', value: mockScores.experience, weight: weights.experience_weight },
    { name: 'Education', value: mockScores.education, weight: weights.education_weight },
    { name: 'Certifications', value: mockScores.certifications, weight: weights.certifications_weight },
  ] : [];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="evidence" className="border-none">
        <AccordionTrigger className="hover:no-underline py-0 px-0">
          <div className={cn(
            "flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium transition-colors",
            getScoreColor(score)
          )}>
            <Trophy className="h-3.5 w-3.5" />
            {Math.round(score)}% Match
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className={cn(
            "mt-3 space-y-4 p-3 rounded-lg border animate-fade-in",
            getBorderColor(score)
          )}>
            {weights && (
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_200px] gap-4 items-center">
                  <div className="space-y-2">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between text-sm">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            {index === 0 && <Code className="h-3.5 w-3.5 text-blue-500" />}
                            {index === 1 && <Briefcase className="h-3.5 w-3.5 text-purple-500" />}
                            {index === 2 && <GraduationCap className="h-3.5 w-3.5 text-green-500" />}
                            {index === 3 && <Award className="h-3.5 w-3.5 text-amber-500" />}
                            <span className="font-medium">{entry.name}</span>
                          </div>
                          <span className="text-xs text-gray-400 ml-5">Weight: {entry.weight}%</span>
                        </div>
                        <span className="text-gray-600">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
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
            )}

            <div className="grid gap-4 pt-2">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
                  <Code className="h-3.5 w-3.5 text-blue-500" />
                  Matching Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {evidence.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
                  <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                  Experience
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">{evidence.experience}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
                  <GraduationCap className="h-3.5 w-3.5 text-green-500" />
                  Education
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">{evidence.education}</p>
              </div>

              {evidence.certifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {evidence.certifications.map((cert, index) => (
                      <span
                        key={index}
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};