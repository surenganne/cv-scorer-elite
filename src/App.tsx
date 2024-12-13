import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import ConfigureScoring from "./pages/ConfigureScoring";
import UploadCVs from "./pages/UploadCVs";
import CVAnalysis from "./pages/CVAnalysis";
import ManageJDs from "./pages/ManageJDs";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;