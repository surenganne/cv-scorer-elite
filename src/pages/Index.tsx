import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://edb.gov.ae/campaign/images/logo-blue.svg"
                alt="EDB Logo"
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-2xl font-semibold text-[#1C26A8]">
                  CV Scorer Elite
                </h1>
                <p className="text-sm text-gray-500">
                  AI-Powered Candidate Evaluation
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Upload CVs</CardTitle>
              <Upload className="h-5 w-5 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Batch upload CVs in PDF or Word format
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
                Job Description & Criteria
              </CardTitle>
              <Award className="h-5 w-5 text-[#1C26A8]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Set Job Description and scoring weights
              </p>
              <Link to="/configure-scoring">
                <Button className="w-full bg-[#1C26A8] hover:bg-[#161d86]">
                  Set Criteria
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