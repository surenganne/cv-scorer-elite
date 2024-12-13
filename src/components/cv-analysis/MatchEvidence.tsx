import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, GraduationCap, Briefcase, Code, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Calculate individual scores based on weights
  const mockScores = {
    skills: Math.round(score * (weights?.skills_weight || 25) / 100),
    experience: Math.round(score * (weights?.experience_weight || 25) / 100),
    education: Math.round(score * (weights?.education_weight || 25) / 100),
    certifications: Math.round(score * (weights?.certifications_weight || 25) / 100),
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="evidence" className="border-none">
        <AccordionTrigger className="hover:no-underline p-0">
          <div className="flex items-center gap-3 group">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              getScoreColor(score)
            )}>
              <Trophy className="h-4 w-4" />
              {Math.round(score)}% Match
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className={cn(
            "mt-4 space-y-6 p-4 rounded-lg border animate-fade-in",
            getBorderColor(score)
          )}>
            {weights && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Technical Skills</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{mockScores.skills}%</span>
                        <span className="text-xs text-gray-400">Weight: {weights.skills_weight}%</span>
                      </div>
                    </div>
                    <Progress value={mockScores.skills} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{mockScores.experience}%</span>
                        <span className="text-xs text-gray-400">Weight: {weights.experience_weight}%</span>
                      </div>
                    </div>
                    <Progress value={mockScores.experience} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Education</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{mockScores.education}%</span>
                        <span className="text-xs text-gray-400">Weight: {weights.education_weight}%</span>
                      </div>
                    </div>
                    <Progress value={mockScores.education} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">Certifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{mockScores.certifications}%</span>
                        <span className="text-xs text-gray-400">Weight: {weights.certifications_weight}%</span>
                      </div>
                    </div>
                    <Progress value={mockScores.certifications} className="h-2" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-6 pt-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  Matching Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {evidence.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-500" />
                  Experience
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">{evidence.experience}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-500" />
                  Education
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">{evidence.education}</p>
              </div>

              {evidence.certifications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {evidence.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium"
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