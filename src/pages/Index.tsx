import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Award, Users, FileText, ChartBar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: cvStats } = useQuery({
    queryKey: ["cvStats"],
    queryFn: async () => {
      const { count: totalCVs } = await supabase
        .from("cv_uploads")
        .select("*", { count: 'exact', head: true });

      const { count: activeJobs } = await supabase
        .from("job_descriptions")
        .select("*", { count: 'exact', head: true })
        .eq("status", "active");

      return {
        totalCVs: totalCVs || 0,
        activeJobs: activeJobs || 0,
      };
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Notice Section */}
        <Alert variant="default" className="mb-8 border-blue-200 bg-blue-50">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800 font-semibold text-lg">
            Proof of Concept
          </AlertTitle>
          <AlertDescription className="text-blue-700 mt-1">
            This CV Scorer Elite application is a proof of concept that demonstrates AI-powered CV analysis 
            and job matching capabilities. For demonstration purposes only.
          </AlertDescription>
        </Alert>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cvStats?.totalCVs || 0}</div>
              <p className="text-xs text-gray-500">Uploaded resumes in the system</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <ChartBar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cvStats?.activeJobs || 0}</div>
              <p className="text-xs text-gray-500">Open job positions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Analysis Status</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-gray-500">System is ready for matching</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Upload CVs</CardTitle>
              <Upload className="h-5 w-5 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Batch upload CVs in PDF or Word format for analysis
              </p>
              <Link to="/upload-cvs">
                <Button className="w-full bg-[#1C26A8] hover:bg-[#161d86]">
                  Start Upload
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">
                Match Candidates
              </CardTitle>
              <Award className="h-5 w-5 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Find the best matches for your job positions
              </p>
              <Link to="/cv-analysis">
                <Button className="w-full bg-[#1C26A8] hover:bg-[#161d86]">
                  Start Matching
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
