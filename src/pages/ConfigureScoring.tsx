import { ScoringWeights } from "@/components/scoring/ScoringWeights";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";

const ConfigureScoring = () => {
  const [experienceWeight, setExperienceWeight] = useState(25);
  const [skillsWeight, setSkillsWeight] = useState(25);
  const [educationWeight, setEducationWeight] = useState(25);
  const [certificationsWeight, setCertificationsWeight] = useState(25);

  const handleWeightChange = (type: string, value: number) => {
    switch (type) {
      case "experience":
        setExperienceWeight(value);
        break;
      case "skills":
        setSkillsWeight(value);
        break;
      case "education":
        setEducationWeight(value);
        break;
      case "certifications":
        setCertificationsWeight(value);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScoringWeights
          experienceWeight={experienceWeight}
          skillsWeight={skillsWeight}
          educationWeight={educationWeight}
          certificationsWeight={certificationsWeight}
          onWeightChange={handleWeightChange}
        />
      </main>
    </div>
  );
};

export default ConfigureScoring;