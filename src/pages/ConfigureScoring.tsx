import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const ConfigureScoring = () => {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [experienceWeight, setExperienceWeight] = useState(25);
  const [skillsWeight, setSkillsWeight] = useState(35);
  const [educationWeight, setEducationWeight] = useState(25);
  const [certificationsWeight, setCertificationsWeight] = useState(15);
  const [minimumExperience, setMinimumExperience] = useState("2");
  const [educationLevel, setEducationLevel] = useState("bachelors");

  const handleSave = () => {
    // Validate total weight is 100%
    const totalWeight =
      experienceWeight + skillsWeight + educationWeight + certificationsWeight;
    
    if (totalWeight !== 100) {
      toast({
        variant: "destructive",
        title: "Invalid weights",
        description: "The sum of all weights must equal 100%",
      });
      return;
    }

    // Save configuration
    console.log("Saving configuration:", {
      jobDescription,
      weights: {
        experience: experienceWeight,
        skills: skillsWeight,
        education: educationWeight,
        certifications: certificationsWeight,
      },
      requirements: {
        minimumExperience,
        educationLevel,
      },
    });

    toast({
      title: "Configuration saved",
      description: "Your scoring criteria have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-semibold text-[#1C26A8]">
              Configure Scoring
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter the job description and key requirements..."
                className="min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scoring Weights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Experience ({experienceWeight}%)</Label>
                  <Slider
                    value={[experienceWeight]}
                    onValueChange={(value) => setExperienceWeight(value[0])}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Skills ({skillsWeight}%)</Label>
                  <Slider
                    value={[skillsWeight]}
                    onValueChange={(value) => setSkillsWeight(value[0])}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Education ({educationWeight}%)</Label>
                  <Slider
                    value={[educationWeight]}
                    onValueChange={(value) => setEducationWeight(value[0])}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Certifications ({certificationsWeight}%)</Label>
                  <Slider
                    value={[certificationsWeight]}
                    onValueChange={(value) => setCertificationsWeight(value[0])}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minimum Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Minimum Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={minimumExperience}
                    onChange={(e) => setMinimumExperience(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Minimum Education Level</Label>
                  <RadioGroup
                    value={educationLevel}
                    onValueChange={setEducationLevel}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="highschool" id="highschool" />
                      <Label htmlFor="highschool">High School</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bachelors" id="bachelors" />
                      <Label htmlFor="bachelors">Bachelor's Degree</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masters" id="masters" />
                      <Label htmlFor="masters">Master's Degree</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phd" id="phd" />
                      <Label htmlFor="phd">PhD</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            className="w-full bg-[#1C26A8] hover:bg-[#161d86]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ConfigureScoring;