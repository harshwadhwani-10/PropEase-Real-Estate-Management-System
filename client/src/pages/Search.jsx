import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search as SearchIcon,
  Home,
  Tag,
  Key,
  Car,
  Sofa,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PropertyCard from "../components/listing/PropertyCard";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import api from "../utils/api";

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "createdAt",
    order: "desc",
    minPrice: "",
    maxPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    amenities: true,
    price: true,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const typeFromUrl = urlParams.get("type");
    const parkingFromUrl = urlParams.get("parking");
    const furnishedFromUrl = urlParams.get("furnished");
    const offerFromUrl = urlParams.get("offer");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");
    const minPriceFromUrl = urlParams.get("minPrice");
    const maxPriceFromUrl = urlParams.get("maxPrice");

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl ||
      minPriceFromUrl ||
      maxPriceFromUrl
    ) {
      setSidebarData({
        searchTerm: searchTermFromUrl || "",
        type: typeFromUrl || "all",
        parking: parkingFromUrl === "true",
        furnished: furnishedFromUrl === "true",
        offer: offerFromUrl === "true",
        sort: sortFromUrl || "createdAt",
        order: orderFromUrl || "desc",
        minPrice: minPriceFromUrl || "",
        maxPrice: maxPriceFromUrl || "",
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      try {
        const res = await api.get(`/api/listing/get?${searchQuery}`);
        const data = res.data;
        if (data.length > 8) {
          setShowMore(true);
        }
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "all" || id === "rent" || id === "sale") {
      setSidebarData({ ...sidebarData, type: id });
    } else if (type === "checkbox") {
      setSidebarData({
        ...sidebarData,
        [id]: checked,
      });
    } else if (id === "sort_order") {
      const [sort, order] = value.split("_");
      setSidebarData({ ...sidebarData, sort, order });
    } else {
      setSidebarData({
        ...sidebarData,
        [id]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    if (sidebarData.searchTerm) urlParams.set("searchTerm", sidebarData.searchTerm);
    if (sidebarData.type !== "all") urlParams.set("type", sidebarData.type);
    if (sidebarData.parking) urlParams.set("parking", "true");
    if (sidebarData.furnished) urlParams.set("furnished", "true");
    if (sidebarData.offer) urlParams.set("offer", "true");
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("order", sidebarData.order);
    if (sidebarData.minPrice) urlParams.set("minPrice", sidebarData.minPrice);
    if (sidebarData.maxPrice) urlParams.set("maxPrice", sidebarData.maxPrice);

    navigate(`/search?${urlParams.toString()}`);
    setShowFilters(false);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", numberOfListings.toString());
    const searchQuery = urlParams.toString();
    try {
      const res = await api.get(`/api/listing/get?${searchQuery}`);
      const data = res.data;
      if (data.length < 9) {
        setShowMore(false);
      }
      setListings([...listings, ...data]);
    } catch (error) {
      console.error("Error loading more listings:", error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const FilterSidebar = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 h-fit border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-[#2A4365]" />
          Filters
        </h2>
        <button
          onClick={() => setShowFilters(false)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Term */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <SearchIcon className="w-4 h-4 text-orange-500" />
            Search Location
          </label>
          <input
            type="text"
            id="searchTerm"
            placeholder="City, area, or property name..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={sidebarData.searchTerm}
            onChange={handleChange}
          />
        </div>

        {/* Property Type */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("type")}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3"
          >
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4 text-orange-500" />
              Property Type
            </span>
            {expandedSections.type ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.type && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                <input
                  type="radio"
                  name="type"
                  id="all"
                  className="w-4 h-4 text-[#2A4365]"
                  onChange={handleChange}
                  checked={sidebarData.type === "all"}
                />
                <span className="text-gray-700">All Types</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                <input
                  type="radio"
                  name="type"
                  id="rent"
                  className="w-4 h-4 text-[#2A4365]"
                  onChange={handleChange}
                  checked={sidebarData.type === "rent"}
                />
                <span className="text-gray-700">For Rent</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                <input
                  type="radio"
                  name="type"
                  id="sale"
                  className="w-4 h-4 text-[#2A4365]"
                  onChange={handleChange}
                  checked={sidebarData.type === "sale"}
                />
                <span className="text-gray-700">For Sale</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="offer"
                  className="w-4 h-4 text-orange-500 rounded"
                  onChange={handleChange}
                  checked={sidebarData.offer}
                />
                <Tag className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700">Special Offers Only</span>
              </label>
            </div>
          )}
        </div>

        {/* Amenities */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("amenities")}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3"
          >
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-500" />
              Amenities
            </span>
            {expandedSections.amenities ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.amenities && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="parking"
                  className="w-4 h-4 text-orange-500 rounded"
                  onChange={handleChange}
                  checked={sidebarData.parking}
                />
                <Car className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Parking Spot</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="furnished"
                  className="w-4 h-4 text-orange-500 rounded"
                  onChange={handleChange}
                  checked={sidebarData.furnished}
                />
                <Sofa className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Furnished</span>
              </label>
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3"
          >
            <span>Price Range</span>
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.price && (
            <div className="space-y-3">
              <div className="flex gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    id="minPrice"
                    placeholder="Min"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    value={sidebarData.minPrice}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    id="maxPrice"
                    placeholder="Max"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    value={sidebarData.maxPrice}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sort By
          </label>
          <select
            onChange={handleChange}
            id="sort_order"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            value={`${sidebarData.sort}_${sidebarData.order}`}
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="regularPrice_asc">Price: Low to High</option>
            <option value="regularPrice_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#2A4365] hover:bg-[#1e2f47] text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <SearchIcon className="w-5 h-5" />
          Apply Filters
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowFilters(true)}
                className="w-full bg-white p-4 rounded-xl shadow-lg flex items-center justify-between border border-gray-100"
              >
                <span className="flex items-center gap-2 font-semibold text-gray-900">
                  <SlidersHorizontal className="w-5 h-5 text-[#2A4365]" />
                  Filters
                </span>
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Mobile Filter Sidebar */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start">
                <div className="bg-white w-full max-w-sm h-full overflow-y-auto">
                  <FilterSidebar />
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Search Results
                </h1>
                <p className="text-gray-600 mt-1">
                  {loading ? "Loading..." : `${listings.length} ${listings.length === 1 ? "property" : "properties"} found`}
                </p>
              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <LoadingSkeleton count={8} />
            ) : listings.length === 0 ? (
              <EmptyState
                title="No properties found"
                message="Try adjusting your search filters or browse all properties."
                showRetry={false}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing, index) => (
                    <PropertyCard key={listing._id} listing={listing} index={index} />
                  ))}
                </div>
                {showMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={onShowMoreClick}
                      className="bg-[#2A4365] hover:bg-[#1e2f47] text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg"
                    >
                      Show More Properties
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
