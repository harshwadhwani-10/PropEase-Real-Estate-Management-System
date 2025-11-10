import { Home, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ 
  title = "No results found", 
  message = "Try adjusting your search filters to find more properties.",
  showRetry = false,
  onRetry 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md">{message}</p>
      <div className="flex gap-4">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-[#2A4365] text-white rounded-xl font-semibold hover:bg-[#1e2f47] transition-colors shadow-lg"
          >
            Try Again
          </button>
        )}
        <Link
          to="/search"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Browse All Properties
        </Link>
      </div>
    </div>
  );
}

