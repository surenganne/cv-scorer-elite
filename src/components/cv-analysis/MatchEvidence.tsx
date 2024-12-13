import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="evidence">
        <AccordionTrigger className="text-sm">
          View Match Evidence ({Math.round(score)}% Match)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 p-4 bg-gray-50 rounded-md text-sm">
            {weights && (
              <div className="mb-4 p-3 bg-white rounded border border-gray-100">
                <h4 className="font-semibold mb-2">Scoring Weights:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span className="font-medium">{weights.experience_weight}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skills:</span>
                    <span className="font-medium">{weights.skills_weight}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Education:</span>
                    <span className="font-medium">{weights.education_weight}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certifications:</span>
                    <span className="font-medium">{weights.certifications_weight}%</span>
                  </div>
                </div>
              </div>
            )}
            <div>
              <h4 className="font-semibold mb-1">Skills Match:</h4>
              <ul className="list-disc list-inside">
                {evidence.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Experience:</h4>
              <p>{evidence.experience}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Education:</h4>
              <p>{evidence.education}</p>
            </div>
            {evidence.certifications.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Certifications:</h4>
                <ul className="list-disc list-inside">
                  {evidence.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};