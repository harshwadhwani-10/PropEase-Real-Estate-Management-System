import { motion } from "framer-motion";
import { Filter, Home, Tag, Building2, RotateCcw } from "lucide-react";

export default function MapFilterPanel({ 
  filters, 
  onFilterChange, 
  onResetView,
  totalCount = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#2A4365]" />
          Filters
        </h3>
        {onResetView && (
          <button
            onClick={onResetView}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-all group">
          <input
            type="checkbox"
            checked={filters.showRent}
            onChange={(e) => onFilterChange("showRent", e.target.checked)}
            className="w-5 h-5 text-green-600 rounded focus:ring-green-500 focus:ring-2"
          />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-6 h-6 rounded-full bg-green-500 shadow-md group-hover:scale-110 transition-transform"></div>
            <span className="text-sm font-medium text-gray-700">For Rent</span>
          </div>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-all group">
          <input
            type="checkbox"
            checked={filters.showSale}
            onChange={(e) => onFilterChange("showSale", e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-6 h-6 rounded-full bg-blue-500 shadow-md group-hover:scale-110 transition-transform"></div>
            <span className="text-sm font-medium text-gray-700">For Sale</span>
          </div>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-all group">
          <input
            type="checkbox"
            checked={filters.showCommercial}
            onChange={(e) => onFilterChange("showCommercial", e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
          />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-6 h-6 rounded-full bg-purple-500 shadow-md group-hover:scale-110 transition-transform"></div>
            <span className="text-sm font-medium text-gray-700">Commercial</span>
          </div>
        </label>
      </div>
      
      {totalCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-semibold text-[#2A4365]">{totalCount}</span> properties shown
          </p>
        </div>
      )}
    </motion.div>
  );
}

