import { Link } from "react-router-dom";
import { MapPin, Bed, Bath } from "lucide-react";

export default function MapPopup({ listing, onNavigate }) {
  if (!listing) return null;

  const price = listing.offer ? listing.discountPrice : listing.regularPrice;

  const handleViewDetails = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(listing._id);
    } else {
      window.location.href = `/listing/${listing._id}`;
    }
  };

  return (
    <div className="p-4 max-w-sm w-80">
      <div className="relative">
        <img
          src={listing.imageUrls?.[0] || "https://via.placeholder.com/300"}
          alt={listing.name}
          className="w-full h-40 object-cover rounded-xl mb-3 shadow-md"
        />
        {listing.offer && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            Special Offer
          </div>
        )}
        {listing.status === "approved" && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            Verified
          </div>
        )}
      </div>
      
      <h3 className="font-bold text-base mb-2 text-gray-900 line-clamp-1">{listing.name}</h3>
      
      <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-3">
        <MapPin className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
        <p className="line-clamp-2">{listing.address}</p>
      </div>
      
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Bed className="w-4 h-4 text-[#2A4365]" />
          <span>{listing.bedrooms}</span>
        </div>
        <div className="flex items-center gap-1">
          <Bath className="w-4 h-4 text-[#2A4365]" />
          <span>{listing.bathrooms}</span>
        </div>
      </div>
      
      <p className="text-lg font-bold text-[#2A4365] mb-4">
        ₹{price.toLocaleString("en-IN")}
        {listing.type === "rent" && (
          <span className="text-sm font-normal text-gray-600"> / month</span>
        )}
      </p>
      
      <Link
        to={`/listing/${listing._id}`}
        onClick={handleViewDetails}
        className="block w-full bg-gradient-to-r from-[#2A4365] to-[#1e2f47] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all text-center"
      >
        View Details
      </Link>
    </div>
  );
}
