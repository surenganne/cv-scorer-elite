import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ConfigureScoring from "./pages/ConfigureScoring";
import UploadCVs from "./pages/UploadCVs";
import CVAnalysis from "./pages/CVAnalysis";
import ManageJDs from "./pages/ManageJDs";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/configure-scoring" element={<ConfigureScoring />} />
        <Route path="/configure-scoring/:id" element={<ConfigureScoring />} />
        <Route path="/upload-cvs" element={<UploadCVs />} />
        <Route path="/cv-analysis" element={<CVAnalysis />} />
        <Route path="/manage-jds" element={<ManageJDs />} />
      </Routes>
    </Router>
  );
}

export default App;