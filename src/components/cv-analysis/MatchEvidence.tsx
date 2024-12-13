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
}

export const MatchEvidence = ({ score, evidence }: MatchEvidenceProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="evidence">
        <AccordionTrigger className="text-sm">
          View Match Evidence ({Math.round(score)}% Match)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 p-4 bg-gray-50 rounded-md text-sm">
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