import { ScoringWeights } from "@/components/scoring/ScoringWeights";
import Navbar from "@/components/layout/Navbar";

const ConfigureScoring = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScoringWeights />
      </main>
    </div>
  );
};

export default ConfigureScoring;