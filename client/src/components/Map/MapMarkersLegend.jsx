import { motion } from "framer-motion";
import { Home, Tag } from "lucide-react";

export default function MapMarkersLegend({ filters, onFilterChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-gray-200"
    >
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Tag className="w-4 h-4 text-[#2A4365]" />
        Filter by Type
      </h3>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={filters.showRent}
            onChange={(e) => onFilterChange("showRent", e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700">For Rent</span>
          </div>
        </label>
        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={filters.showSale}
            onChange={(e) => onFilterChange("showSale", e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-700">For Sale</span>
          </div>
        </label>
        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={filters.showCommercial}
            onChange={(e) => onFilterChange("showCommercial", e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-700">Commercial</span>
          </div>
        </label>
      </div>
    </motion.div>
  );
}

