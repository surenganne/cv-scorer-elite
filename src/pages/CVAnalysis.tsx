import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CVTable } from "@/components/cv-analysis/CVTable";
import { CVFilters } from "@/components/cv-analysis/CVFilters";

const CVAnalysis = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-semibold text-[#1C26A8]">
              CV Analysis Dashboard
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CVFilters />
        <div className="mt-6">
          <CVTable />
        </div>
      </main>
    </div>
  );
};

export default CVAnalysis;