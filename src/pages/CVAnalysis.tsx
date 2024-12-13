import { CVTable } from "@/components/cv-analysis/CVTable";
import { CVFilters } from "@/components/cv-analysis/CVFilters";
import Navbar from "@/components/layout/Navbar";

const CVAnalysis = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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