import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://edb.gov.ae/campaign/images/logo-blue.svg" 
                alt="EDB Logo" 
                className="h-8 w-auto mr-2"
              />
            </Link>
            <div className="flex space-x-8 ml-8">
              <Link
                to="/"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  isActive("/")
                    ? "border-[#1C26A8] text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                Home
              </Link>
              <Link
                to="/manage-jds"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  isActive("/manage-jds")
                    ? "border-[#1C26A8] text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                Job Descriptions
              </Link>
              <Link
                to="/upload-cvs"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  isActive("/upload-cvs")
                    ? "border-[#1C26A8] text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                Upload CVs
              </Link>
              <Link
                to="/cv-analysis"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  isActive("/cv-analysis")
                    ? "border-[#1C26A8] text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                CV Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;