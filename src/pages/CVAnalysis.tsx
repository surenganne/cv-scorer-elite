import Navbar from "@/components/layout/Navbar";
import { JobMatchList } from "@/components/cv-analysis/JobMatchList";

const CVAnalysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CV Scorer Elite</h1>
            <p className="text-gray-500 mt-2">
              Match CVs with job descriptions based on skills, experience, and other criteria.
            </p>
          </div>
          <JobMatchList />
        </div>
      </main>
    </div>
  );
};

export default CVAnalysis;