import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function MapListPopup({ listings = [], onNavigate }) {
  if (!listings || listings.length === 0) return null;

  const handleViewDetails = (listingId, e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(listingId);
    } else {
      window.location.href = `/listing/${listingId}`;
    }
  };

  // Truncate text helper
  const truncateText = (text, maxLength = 40) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="p-2 max-w-sm w-72">
      <div className="mb-1.5">
        <h3 className="font-bold text-sm text-gray-900 mb-0.5">
          {listings.length} {listings.length === 1 ? "Property" : "Properties"} Nearby
        </h3>
        <p className="text-xs text-gray-500">Click on a property to view details</p>
      </div>
      
      <div className="space-y-1.5 max-h-96 overflow-y-auto">
        {listings.map((listing) => {
          const price = listing.offer ? listing.discountPrice : listing.regularPrice;
          const priceText =
            price >= 1000000
              ? `₹${(price / 1000000).toFixed(1)}M`
              : price >= 1000
              ? `₹${(price / 1000).toFixed(0)}K`
              : `₹${price}`;

          return (
            <div
              key={listing._id}
              className="flex gap-2 p-1.5 rounded-lg border border-gray-200 hover:border-[#2A4365] hover:bg-gray-50 transition-all cursor-pointer group"
            >
              {/* Small Image */}
              <div className="relative flex-shrink-0">
                <img
                  src={listing.imageUrls?.[0] || "https://via.placeholder.com/300"}
                  alt={listing.name}
                  className="w-14 h-14 object-cover rounded-md shadow-sm group-hover:shadow-md transition-shadow"
                />
                {listing.offer && (
                  <div className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white px-1 py-0.5 rounded-full text-[9px] font-semibold shadow-md">
                    Offer
                  </div>
                )}
                {listing.status === "approved" && (
                  <div className="absolute -bottom-0.5 -left-0.5 bg-emerald-500 text-white px-1 py-0.5 rounded-full text-[9px] font-semibold shadow-md">
                    ✓
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900 mb-0.5 line-clamp-1 leading-tight">
                    {truncateText(listing.name, 35)}
                  </h4>
                  
                  <div className="flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
                    <p className="text-[10px] text-gray-600 line-clamp-1 leading-tight">{truncateText(listing.address, 30)}</p>
                  </div>
                  
                  <p className="text-xs font-bold text-[#2A4365] mb-1 leading-tight">
                    {priceText}
                    {listing.type === "rent" && (
                      <span className="text-[10px] font-normal text-gray-600"> /mo</span>
                    )}
                  </p>
                </div>
                
                <Link
                  to={`/listing/${listing._id}`}
                  onClick={(e) => handleViewDetails(listing._id, e)}
                  className="block w-full bg-gradient-to-r from-[#2A4365] to-[#1e2f47] text-white px-2 py-1.5 rounded-md text-xs font-semibold hover:shadow-md transition-all text-center leading-tight"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

