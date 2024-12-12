import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Users, Award, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="https://edb.gov.ae/campaign/images/logo-blue.svg"
                alt="EDB Logo"
                className="h-8 w-auto"
              />
              <h1 className="ml-4 text-2xl font-semibold text-[#1C26A8]">
                CV Scorer Elite
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Upload CVs</CardTitle>
              <Upload className="h-4 w-4 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#1C26A8] hover:bg-[#161d86]">
                Start Upload
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Configure Scoring
              </CardTitle>
              <Award className="h-4 w-4 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#1C26A8] hover:bg-[#161d86]">
                Set Criteria
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                View Candidates
              </CardTitle>
              <Users className="h-4 w-4 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#1C26A8] hover:bg-[#161d86]">
                Show List
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Send Results</CardTitle>
              <Mail className="h-4 w-4 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#1C26A8] hover:bg-[#161d86]">
                Email Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome to CV Scorer Elite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Streamline your candidate selection process with our AI-powered CV
              analysis tool. Upload CVs, set custom scoring criteria, and get
              instant insights into your candidate pool.
            </p>
          </CardContent>
        </Card>

        {/* Placeholder for future components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">No recent uploads</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">No candidates analyzed yet</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;