import { ScoringWeights } from "@/components/scoring/ScoringWeights";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const ConfigureScoring = () => {
  const { toast } = useToast();
  const [experienceWeight, setExperienceWeight] = useState(25);
  const [skillsWeight, setSkillsWeight] = useState(25);
  const [educationWeight, setEducationWeight] = useState(25);
  const [certificationsWeight, setCertificationsWeight] = useState(25);
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [minimumExperience, setMinimumExperience] = useState("");
  const [preferredQualifications, setPreferredQualifications] = useState("");

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

  const handleSave = () => {
    // Here you would typically save the configuration to your backend
    toast({
      title: "Success",
      description: "Scoring configuration has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Job Requirements</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Enter detailed job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="requiredSkills">Required Skills</Label>
                <Textarea
                  id="requiredSkills"
                  placeholder="Enter required skills (e.g., Python, React, SQL)..."
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="minimumExperience">Minimum Experience (years)</Label>
                <Input
                  id="minimumExperience"
                  type="number"
                  placeholder="Enter minimum years of experience..."
                  value={minimumExperience}
                  onChange={(e) => setMinimumExperience(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="preferredQualifications">Preferred Qualifications</Label>
                <Textarea
                  id="preferredQualifications"
                  placeholder="Enter preferred qualifications..."
                  value={preferredQualifications}
                  onChange={(e) => setPreferredQualifications(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Scoring Weights</h2>
            <ScoringWeights
              experienceWeight={experienceWeight}
              skillsWeight={skillsWeight}
              educationWeight={educationWeight}
              certificationsWeight={certificationsWeight}
              onWeightChange={handleWeightChange}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              Save Configuration
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfigureScoring;