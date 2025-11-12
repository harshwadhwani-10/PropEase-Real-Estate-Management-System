import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Car, Sofa, Share2, Mail, User, Edit } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";

export default function InfoCard({ listing, onInquire }) {
  const { currentUser } = useSelector((state) => state.user);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if current user is the owner
  const isOwner = currentUser && listing.userRef && (
    (typeof listing.userRef === 'object' && listing.userRef._id === currentUser._id) ||
    (typeof listing.userRef === 'string' && listing.userRef === currentUser._id)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl p-6 lg:sticky lg:top-24 border border-gray-100"
    >
      {/* Share Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
          title="Share"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
          {copied && (
            <span className="absolute -top-8 right-0 bg-[#2A4365] text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
              Link copied!
            </span>
          )}
        </button>
      </div>

      {/* Title */}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
        {listing.name}
      </h1>

      {/* Price */}
      <div className="mb-6">
        <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#2A4365] to-[#F6AD55] bg-clip-text text-transparent">
          ₹
          {listing.offer
            ? listing.discountPrice.toLocaleString("en-IN")
            : listing.regularPrice.toLocaleString("en-IN")}
          {listing.type === "rent" && (
            <span className="text-lg text-gray-600 font-normal">/month</span>
          )}
        </p>
        {listing.offer && (
          <p className="text-sm text-gray-500 line-through mt-1">
            ₹{listing.regularPrice.toLocaleString("en-IN")}
            {listing.type === "rent" && " / month"}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-6 text-gray-600">
        <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
        <p className="text-sm">{listing.address}</p>
      </div>

      {/* Owner Info */}
      {listing.userRef && typeof listing.userRef === 'object' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide font-semibold">Owner</p>
          <div className="flex items-center gap-3">
            {listing.userRef.avatar && (
              <img
                src={listing.userRef.avatar}
                alt={listing.userRef.username || "Owner"}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                {listing.userRef.username || listing.userRef.email || "Unknown Owner"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            listing.type === "rent"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {listing.type === "rent" ? "For Rent" : "For Sale"}
        </span>
        {listing.offer && (
          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
            Special Offer
          </span>
        )}
        {listing.status === "approved" && (
          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
            Verified
          </span>
        )}
      </div>

      {/* Property Features */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Bed className="w-5 h-5 text-[#2A4365]" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Bedrooms</p>
            <p className="font-semibold text-gray-900">{listing.bedrooms}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Bath className="w-5 h-5 text-[#2A4365]" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Bathrooms</p>
            <p className="font-semibold text-gray-900">{listing.bathrooms}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Car className="w-5 h-5 text-[#2A4365]" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Parking</p>
            <p className="font-semibold text-gray-900">
              {listing.parking ? "Yes" : "No"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Sofa className="w-5 h-5 text-[#2A4365]" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Furnished</p>
            <p className="font-semibold text-gray-900">
              {listing.furnished ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!currentUser && (
          <>
            <Link
              to={`/sign-in?next=${encodeURIComponent(location.pathname)}`}
              className="block w-full bg-[#2A4365] text-white rounded-xl hover:bg-[#1e2f47] p-4 font-semibold transition-colors text-center shadow-lg"
            >
              Sign In to Inquire
            </Link>
            <p className="text-xs text-gray-500 text-center">
              Sign in to contact the owner or make an inquiry
            </p>
          </>
        )}
        {currentUser && !isOwner && (
          <button
            onClick={onInquire}
            className="w-full bg-gradient-to-r from-[#2A4365] to-[#1e2f47] text-white rounded-xl hover:shadow-xl p-4 font-semibold transition-all flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5"
          >
            <Mail className="w-5 h-5" />
            Inquire About Property
          </button>
        )}
        {isOwner && (
          <div className="space-y-3">
            <Link
              to={`/owner/edit-listing/${listing._id}`}
              className="w-full bg-gradient-to-r from-[#2A4365] to-[#1e2f47] text-white rounded-xl hover:shadow-xl p-4 font-semibold transition-all flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5"
            >
              <Edit className="w-5 h-5" />
              Edit Listing
            </Link>
            <p className="text-sm text-gray-500 text-center">
              This is your own listing
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
