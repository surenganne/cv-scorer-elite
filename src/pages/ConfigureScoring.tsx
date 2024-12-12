import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ConfigureScoring = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [criteria, setCriteria] = useState([
    { name: "Technical Skills", weight: 30 },
    { name: "Experience", weight: 25 },
    { name: "Education", weight: 20 },
    { name: "Certifications", weight: 15 },
    { name: "Industry Knowledge", weight: 10 },
  ]);

  const handleWeightChange = (index: number, value: string) => {
    const newCriteria = [...criteria];
    newCriteria[index].weight = parseInt(value) || 0;
    setCriteria(newCriteria);
  };

  const handleSave = () => {
    // TODO: Save configuration
    console.log("Saving configuration:", { jobDescription, criteria });
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
                placeholder="Enter the job description here..."
                className="min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scoring Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criteria.map((criterion, index) => (
                  <div key={criterion.name} className="flex items-center gap-4">
                    <div className="flex-grow">
                      <Label>{criterion.name}</Label>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={criterion.weight}
                        onChange={(e) => handleWeightChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Button
                    onClick={handleSave}
                    className="w-full bg-[#1C26A8] hover:bg-[#161d86]"
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ConfigureScoring;