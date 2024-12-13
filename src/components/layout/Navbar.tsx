import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react"; // Using Github icon as a logo since it's one of the recommended options

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
              <Github className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-semibold text-primary">CV Analyzer</span>
            </Link>
            <div className="flex space-x-8 ml-8">
              <Link
                to="/"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  isActive("/")
                    ? "border-indigo-500 text-gray-900"
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
                    ? "border-indigo-500 text-gray-900"
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
                    ? "border-indigo-500 text-gray-900"
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
                    ? "border-indigo-500 text-gray-900"
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