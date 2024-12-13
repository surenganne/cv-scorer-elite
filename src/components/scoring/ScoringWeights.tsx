import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ScoringWeightsProps {
  experienceWeight: number;
  skillsWeight: number;
  educationWeight: number;
  certificationsWeight: number;
  onWeightChange: (type: string, value: number) => void;
}

export const ScoringWeights = ({
  experienceWeight,
  skillsWeight,
  educationWeight,
  certificationsWeight,
  onWeightChange,
}: ScoringWeightsProps) => {
  const { toast } = useToast();
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    const total = experienceWeight + skillsWeight + educationWeight + certificationsWeight;
    setTotalWeight(total);
  }, [experienceWeight, skillsWeight, educationWeight, certificationsWeight]);

  const handleWeightChange = (type: string, value: number) => {
    const weights = {
      experience: type === "experience" ? value : experienceWeight,
      skills: type === "skills" ? value : skillsWeight,
      education: type === "education" ? value : educationWeight,
      certifications: type === "certifications" ? value : certificationsWeight,
    };

    const newTotal = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

    // Only show warning toast if the new value would increase the total above 100%
    if (newTotal > 100 && newTotal > totalWeight) {
      toast({
        variant: "destructive",
        title: "Invalid weight",
        description: "Total weights cannot exceed 100%",
      });
      return;
    }

    onWeightChange(type, value);
  };

  return (
    <div className="space-y-6">
      {totalWeight > 100 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Total weight ({totalWeight}%) exceeds 100%. Please adjust the weights.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Experience</Label>
          <span className="text-sm text-muted-foreground">{experienceWeight}%</span>
        </div>
        <Slider
          value={[experienceWeight]}
          onValueChange={(value) => handleWeightChange("experience", value[0])}
          max={100}
          step={5}
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Skills</Label>
          <span className="text-sm text-muted-foreground">{skillsWeight}%</span>
        </div>
        <Slider
          value={[skillsWeight]}
          onValueChange={(value) => handleWeightChange("skills", value[0])}
          max={100}
          step={5}
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Education</Label>
          <span className="text-sm text-muted-foreground">{educationWeight}%</span>
        </div>
        <Slider
          value={[educationWeight]}
          onValueChange={(value) => handleWeightChange("education", value[0])}
          max={100}
          step={5}
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Certifications</Label>
          <span className="text-sm text-muted-foreground">{certificationsWeight}%</span>
        </div>
        <Slider
          value={[certificationsWeight]}
          onValueChange={(value) => handleWeightChange("certifications", value[0])}
          max={100}
          step={5}
          className="mt-2"
        />
      </div>

      <div className="flex justify-end mt-4">
        <span className={`text-sm font-medium ${totalWeight > 100 ? 'text-destructive' : totalWeight === 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
          Total: {totalWeight}%
        </span>
      </div>
    </div>
  );
};