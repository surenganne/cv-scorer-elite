import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Percent, Briefcase, Lightbulb, GraduationCap, Award } from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);

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

    // Allow adjustment if total is less than or equal to 100, or if we're reducing a value
    const currentWeight = weights[type as keyof typeof weights];
    const oldWeight = 
      type === "experience" ? experienceWeight :
      type === "skills" ? skillsWeight :
      type === "education" ? educationWeight :
      certificationsWeight;

    if (newTotal <= 100 || currentWeight < oldWeight) {
      onWeightChange(type, value);
    } else if (!isDragging) {
      toast({
        variant: "destructive",
        title: "Weight adjustment limit reached",
        description: "Total weights cannot exceed 100%. Try reducing other weights first.",
      });
    }
  };

  const getWeightColor = (weight: number) => {
    if (weight === 0) return "text-gray-400";
    if (weight < 25) return "text-yellow-500";
    if (weight < 50) return "text-blue-500";
    return "text-green-500";
  };

  const renderSlider = (
    label: string,
    type: string,
    value: number,
    icon: React.ReactNode
  ) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center mb-4">
        <Label className="text-base font-medium flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full bg-gray-100 flex items-center gap-1 ${getWeightColor(value)}`}>
          {value}
          <Percent className="h-3 w-3" />
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(newValue) => handleWeightChange(type, newValue[0])}
        onValueCommit={() => setIsDragging(false)}
        onPointerDown={() => setIsDragging(true)}
        max={100}
        step={5}
        className="mt-2"
      />
      <div className="mt-2 text-xs text-gray-500">
        Drag to adjust the weight for {label.toLowerCase()}
      </div>
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
        {renderSlider("Experience", "experience", experienceWeight, <Briefcase className="h-5 w-5" />)}
        {renderSlider("Skills", "skills", skillsWeight, <Lightbulb className="h-5 w-5" />)}
        {renderSlider("Education", "education", educationWeight, <GraduationCap className="h-5 w-5" />)}
        {renderSlider("Certifications", "certifications", certificationsWeight, <Award className="h-5 w-5" />)}
      </div>

      <div className="flex justify-between items-center mt-6 bg-gray-50 p-4 rounded-lg">
        <span className="text-sm font-medium text-gray-600">Total Weight:</span>
        <span
          className={`text-lg font-semibold ${
            totalWeight > 100
              ? "text-destructive"
              : totalWeight === 100
              ? "text-green-600"
              : "text-blue-500"
          }`}
        >
          {totalWeight}%
        </span>
      </div>
    </div>
  );
};