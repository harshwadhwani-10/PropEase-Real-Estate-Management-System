import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaHome, FaRupeeSign } from "react-icons/fa";

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    searchTerm: "",
    type: "all",
    minPrice: "",
    maxPrice: "",
  });

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    
    if (searchData.searchTerm) {
      urlParams.set("searchTerm", searchData.searchTerm);
    }
    if (searchData.type !== "all") {
      urlParams.set("type", searchData.type);
    }
    if (searchData.minPrice) {
      urlParams.set("minPrice", searchData.minPrice);
    }
    if (searchData.maxPrice) {
      urlParams.set("maxPrice", searchData.maxPrice);
    }

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 max-w-6xl mx-auto relative z-20 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-3 lg:gap-4">
        {/* Location */}
        <div className="md:col-span-12 lg:col-span-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaMapMarkerAlt className="inline mr-2 text-orange-500" />
            Location
          </label>
          <input
            type="text"
            name="searchTerm"
            value={searchData.searchTerm}
            onChange={handleChange}
            placeholder="City or location"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
          />
        </div>

        {/* Property Type */}
        <div className="md:col-span-6 lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaHome className="inline mr-2 text-orange-500" />
            Type
          </label>
          <select
            name="type"
            value={searchData.type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 bg-white"
          >
            <option value="all">All Types</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
          </select>
        </div>

        {/* Min Price */}
        <div className="md:col-span-6 lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaRupeeSign className="inline mr-2 text-orange-500" />
            Min Price
          </label>
          <input
            type="number"
            name="minPrice"
            value={searchData.minPrice}
            onChange={handleChange}
            placeholder="Min"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
          />
        </div>

        {/* Max Price */}
        <div className="md:col-span-6 lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaRupeeSign className="inline mr-2 text-orange-500" />
            Max Price
          </label>
          <input
            type="number"
            name="maxPrice"
            value={searchData.maxPrice}
            onChange={handleChange}
            placeholder="Max"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
          />
        </div>

        {/* Search Button */}
        <div className="md:col-span-6 lg:col-span-2 flex items-end">
          <button
            type="submit"
            className="w-full bg-[#2A4365] hover:bg-[#1e2f47] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaSearch className="text-lg" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
}

