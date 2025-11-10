import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath } from "lucide-react";

// Search Result Card - Enhanced Design
export default function ListingItem({ listing }) {
  return (
    <Link to={`/listing/${listing._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={
              listing.imageUrls[0] ||
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80"
            }
            alt="listing cover"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Price Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="text-white">
              <div className="text-2xl font-bold">
                ₹
                {listing.offer
                  ? listing.discountPrice.toLocaleString("en-IN")
                  : listing.regularPrice.toLocaleString("en-IN")}
                {listing.type === "rent" && (
                  <span className="text-sm font-normal">/month</span>
                )}
              </div>
              {listing.offer && (
                <div className="text-sm text-orange-300 line-through">
                  ₹{listing.regularPrice.toLocaleString("en-IN")}
                </div>
              )}
            </div>
          </div>
          {listing.offer && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              Special Offer
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {listing.name}
          </h3>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="text-orange-500 mr-2 w-4 h-4" />
            <span className="text-sm line-clamp-1">{listing.address}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {listing.description}
          </p>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Bed className="text-[#2A4365] w-4 h-4" />
              <span className="text-sm">
                {listing.bedrooms} {listing.bedrooms > 1 ? "Beds" : "Bed"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="text-[#2A4365] w-4 h-4" />
              <span className="text-sm">
                {listing.bathrooms} {listing.bathrooms > 1 ? "Baths" : "Bath"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

ListingItem.propTypes = {
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
    address: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    offer: PropTypes.bool.isRequired,
    discountPrice: PropTypes.number.isRequired,
    regularPrice: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    bedrooms: PropTypes.number.isRequired,
    bathrooms: PropTypes.number.isRequired,
  }).isRequired,
};
