import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Index } from "@/pages/Index";
import { ManageCVs } from "@/pages/ManageCVs";
import { UploadCVs } from "@/pages/UploadCVs";
import { CVAnalysis } from "@/pages/CVAnalysis";
import { ConfigureScoring } from "@/pages/ConfigureScoring";
import { ManageJDs } from "@/pages/ManageJDs";
import { ViewResume } from "@/pages/ViewResume";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50/40">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/manage-cvs" element={<ManageCVs />} />
            <Route path="/upload-cvs" element={<UploadCVs />} />
            <Route path="/cv-analysis" element={<CVAnalysis />} />
            <Route path="/configure-scoring" element={<ConfigureScoring />} />
            <Route path="/manage-jds" element={<ManageJDs />} />
            <Route path="/view-resume" element={<ViewResume />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;