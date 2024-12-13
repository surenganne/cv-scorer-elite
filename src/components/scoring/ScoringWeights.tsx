import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Percent } from "lucide-react";

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

    if (newTotal <= 100) {
      onWeightChange(type, value);
    } else {
      toast({
        variant: "destructive",
        title: "Weight adjustment limit reached",
        description: "Total weights cannot exceed 100%. Try reducing other weights first.",
      });
    }
  };

  const renderSlider = (
    label: string,
    type: string,
    value: number,
    color: string
  ) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-base font-medium flex items-center gap-2">
          {label}
        </Label>
        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1">
          {value}
          <Percent className="h-3 w-3" />
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(newValue) => handleWeightChange(type, newValue[0])}
        max={100}
        step={5}
        className={`mt-2 ${color}`}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {totalWeight > 100 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Total weight ({totalWeight}%) exceeds 100%. Please adjust the weights to ensure they sum to 100%.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {renderSlider("Experience", "experience", experienceWeight, "accent-blue-500")}
        {renderSlider("Skills", "skills", skillsWeight, "accent-green-500")}
        {renderSlider("Education", "education", educationWeight, "accent-purple-500")}
        {renderSlider("Certifications", "certifications", certificationsWeight, "accent-orange-500")}
      </div>

      <div className="flex justify-end mt-4 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Total:</span>
          <span
            className={`text-lg font-semibold ${
              totalWeight > 100
                ? "text-destructive"
                : totalWeight === 100
                ? "text-green-600"
                : "text-muted-foreground"
            }`}
          >
            {totalWeight}%
          </span>
        </div>
      </div>
    </div>
  );
};