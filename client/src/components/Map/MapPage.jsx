import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, RotateCcw } from "lucide-react";
import MapLeaflet from "./MapLeaflet.jsx";
import MapFilterPanel from "./MapFilterPanel.jsx";
import LoadingSkeleton from "../common/LoadingSkeleton.jsx";
import EmptyState from "../common/EmptyState.jsx";
import api from "../../utils/api";

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.2156, 72.6369]); // Default: Gandhinagar
  const [mapZoom, setMapZoom] = useState(12);
  const [initialCenter, setInitialCenter] = useState([23.2156, 72.6369]);

  // Filter state
  const [filters, setFilters] = useState({
    showRent: true,
    showSale: true,
    showCommercial: true,
  });

  // Fetch approved listings only
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.toString();
        const res = await api.get(
          `/api/listing/get?${searchQuery || "status=approved&limit=200"}`
        );
        const data = res.data || [];

        // Filter only approved listings
        const approvedListings = data.filter(
          (listing) => listing.status === "approved"
        );
        setListings(approvedListings);

        // Keep default Gandhinagar center - don't auto-calculate from listings
        // Map will always start at Gandhinagar by default

        setLoading(false);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError(true);
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  // Apply filters
  useEffect(() => {
    let filtered = [...listings];

    // Filter by type
    filtered = filtered.filter((listing) => {
      if (listing.type === "rent" && !filters.showRent) return false;
      if (listing.type === "sale" && !filters.showSale) return false;
      if (listing.type === "commercial" && !filters.showCommercial)
        return false;
      return true;
    });

    setFilteredListings(filtered);
  }, [listings, filters]);

  // Handle marker click - navigate to listing page
  const handleMarkerClick = useCallback(
    (listingId) => {
      setSelectedListingId(listingId);
      navigate(`/listing/${listingId}`);
    },
    [navigate]
  );

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle map bounds change
  const handleBoundsChange = useCallback((bounds) => {
    // Optionally filter listings by bounds here
  }, []);

  // Handle search location select
  const handleSearchLocationSelect = useCallback((location) => {
    setMapCenter([location.lat, location.lng]);
    setMapZoom(15);
  }, []);

  // Handle reset view
  const handleResetView = useCallback(() => {
    setMapCenter(initialCenter);
    setMapZoom(12);
    setFilters({
      showRent: true,
      showSale: true,
      showCommercial: true,
    });
  }, [initialCenter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2A4365] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">
            Error loading map data
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#2A4365] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1e2f47] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 relative">
      {/* Map Container - Full Height */}
      <div className="flex-1 relative w-full">
        {/* Floating Filter Panel - Bottom Left */}
        <div className="absolute bottom-6 left-6 z-[1000]">
          <MapFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetView={handleResetView}
            totalCount={filteredListings.length}
          />
        </div>

        {/* Map Component */}
        <MapLeaflet
          listings={filteredListings}
          center={mapCenter}
          zoom={mapZoom}
          onMarkerClick={handleMarkerClick}
          selectedListingId={selectedListingId}
          filters={filters}
          onBoundsChange={handleBoundsChange}
          onSearchLocationSelect={handleSearchLocationSelect}
          initialCenter={initialCenter}
          onRecenter={handleResetView}
        />
      </div>

      {filteredListings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-200 pointer-events-auto">
            <EmptyState
              title="No properties found"
              message="Try adjusting your filters or search criteria."
              showRetry={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
