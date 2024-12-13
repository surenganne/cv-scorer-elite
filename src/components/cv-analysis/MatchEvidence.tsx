import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, GraduationCap, Briefcase, Code } from "lucide-react";

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
  // Calculate individual scores (mock calculations - replace with actual logic)
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const mockScores = {
    skills: Math.round(score * 0.9),
    experience: Math.round(score * 0.85),
    education: Math.round(score * 0.95),
    certifications: Math.round(score * 0.8),
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="evidence">
        <AccordionTrigger className="text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Trophy className={`h-5 w-5 ${getScoreColor(score)}`} />
            <span className={`font-semibold ${getScoreColor(score)}`}>
              {Math.round(score)}% Match
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6 p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100">
            {weights && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 mb-3">Candidate Fitment Scores</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-blue-500" />
                        <span>Skills Match</span>
                      </div>
                      <span className="font-medium">{mockScores.skills}%</span>
                    </div>
                    <Progress value={mockScores.skills} className="h-2" />
                    <div className="text-xs text-gray-500">Weight: {weights.skills_weight}%</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-purple-500" />
                        <span>Experience Match</span>
                      </div>
                      <span className="font-medium">{mockScores.experience}%</span>
                    </div>
                    <Progress value={mockScores.experience} className="h-2" />
                    <div className="text-xs text-gray-500">Weight: {weights.experience_weight}%</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                        <span>Education Match</span>
                      </div>
                      <span className="font-medium">{mockScores.education}%</span>
                    </div>
                    <Progress value={mockScores.education} className="h-2" />
                    <div className="text-xs text-gray-500">Weight: {weights.education_weight}%</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span>Certifications Match</span>
                      </div>
                      <span className="font-medium">{mockScores.certifications}%</span>
                    </div>
                    <Progress value={mockScores.certifications} className="h-2" />
                    <div className="text-xs text-gray-500">Weight: {weights.certifications_weight}%</div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 divide-y divide-gray-100">
              <div className="pt-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  Matching Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {evidence.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-500" />
                  Experience
                </h4>
                <p className="text-gray-600">{evidence.experience}</p>
              </div>

              <div className="pt-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-500" />
                  Education
                </h4>
                <p className="text-gray-600">{evidence.education}</p>
              </div>

              {evidence.certifications.length > 0 && (
                <div className="pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {evidence.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-sm"
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