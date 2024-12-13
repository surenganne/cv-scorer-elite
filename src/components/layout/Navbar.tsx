import { Link } from "react-router-dom";

const Navbar = () => {
  return (
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
          <nav className="hidden md:flex space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/configure-scoring"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Configure Scoring
            </Link>
            <Link
              to="/upload-cvs"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Upload CVs
            </Link>
            <Link
              to="/cv-analysis"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              CV Analysis
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;