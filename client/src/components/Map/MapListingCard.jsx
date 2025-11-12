import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Car, Sofa } from "lucide-react";

export default function MapListingCard({ listing, index, isHighlighted = false, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
    >
      <div
        className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${
          isHighlighted
            ? "border-[#2A4365] shadow-2xl scale-[1.03] ring-2 ring-[#2A4365] ring-opacity-50"
            : "border-transparent hover:border-gray-300"
        }`}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={listing.imageUrls?.[0] || "https://via.placeholder.com/400"}
            alt={listing.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {/* Price Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
            <div className="text-white">
              <div className="text-xl font-bold">
                ₹
                {listing.offer
                  ? listing.discountPrice.toLocaleString("en-IN")
                  : listing.regularPrice.toLocaleString("en-IN")}
                {listing.type === "rent" && (
                  <span className="text-sm font-normal">/month</span>
                )}
              </div>
              {listing.offer && (
                <div className="text-xs text-orange-300 line-through">
                  ₹{listing.regularPrice.toLocaleString("en-IN")}
                </div>
              )}
            </div>
          </div>
          {listing.offer && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              Special Offer
            </div>
          )}
          {listing.status === "approved" && (
            <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {listing.name}
          </h3>
          <div className="flex items-start gap-2 text-gray-600 mb-3">
            <MapPin className="text-orange-500 mt-0.5 w-4 h-4 flex-shrink-0" />
            <span className="text-sm line-clamp-2">{listing.address}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <div className="flex items-center gap-1">
              <Bed className="text-[#2A4365] w-4 h-4" />
              <span>{listing.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="text-[#2A4365] w-4 h-4" />
              <span>{listing.bathrooms}</span>
            </div>
            {listing.parking && (
              <div className="flex items-center gap-1">
                <Car className="text-[#2A4365] w-4 h-4" />
                <span>Parking</span>
              </div>
            )}
            {listing.furnished && (
              <div className="flex items-center gap-1">
                <Sofa className="text-[#2A4365] w-4 h-4" />
                <span>Furnished</span>
              </div>
            )}
          </div>
          <Link
            to={`/listing/${listing._id}`}
            className="block mt-3 text-center bg-[#2A4365] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1e2f47] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

