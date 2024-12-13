import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Award, Users, Upload } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const [cvCount, jobCount] = await Promise.all([
        supabase.from("cv_uploads").select("id", { count: 'exact' }),
        supabase.from("job_descriptions").select("id", { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      return {
        totalCVs: cvCount.count || 0,
        activeJobs: jobCount.count || 0,
      };
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-r from-[#1C26A8] to-[#2832B4] text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-left mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to CV Scorer Elite
                </h2>
                <p className="text-gray-100 max-w-xl">
                  Streamline your candidate selection process with our AI-powered CV
                  analysis tool. Upload CVs, set custom scoring criteria, and get
                  instant insights into your candidate pool.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
              <FileText className="h-4 w-4 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCVs || 0}</div>
              <p className="text-xs text-muted-foreground">
                Uploaded and processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Award className="h-4 w-4 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
              <p className="text-xs text-muted-foreground">
                Open positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Recent Matches</CardTitle>
              <Users className="h-4 w-4 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                In the last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Match Rate</CardTitle>
              <Upload className="h-4 w-4 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Average match score
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;