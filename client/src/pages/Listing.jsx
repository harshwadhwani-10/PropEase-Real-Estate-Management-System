import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Car, Sofa, Shield, CheckCircle } from "lucide-react";
import ImageGallery from "../components/listing/ImageGallery";
import InfoCard from "../components/listing/InfoCard";
import PropertyCard from "../components/listing/PropertyCard";
import InquiryModal from "../components/InquiryModal";
import SectionHeader from "../components/common/SectionHeader";
import api from "../utils/api";

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [contact, setContact] = useState(false);
  const [similarListings, setSimilarListings] = useState([]);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/listing/get/${params.listingId}`);
        const data = res.data;
        if (data.success === false) {
          setError(true);
          return;
        }
        setListing(data);

        // Fetch similar listings
        if (data.type) {
          try {
            const similarRes = await api.get(
              `/api/listing/get?type=${data.type}&limit=3`
            );
            setSimilarListings(
              similarRes.data.filter((l) => l._id !== data._id).slice(0, 3)
            );
          } catch (err) {
            console.error("Error fetching similar listings:", err);
          }
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.listingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2A4365] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="bg-[#2A4365] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1e2f47] transition-colors"
            >
              Go Back Home
            </button>
            <Link
              to="/search"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Images & Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ImageGallery images={listing.imageUrls} name={listing.name} />
            </motion.div>

            {/* Property Title & Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex flex-wrap gap-2 mb-4">
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
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {listing.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 text-orange-500" />
                <p className="text-lg">{listing.address}</p>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                {listing.description}
              </p>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                  <Bed className="w-8 h-8 text-[#2A4365] mb-2" />
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-lg font-bold text-gray-900">{listing.bedrooms}</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                  <Bath className="w-8 h-8 text-[#2A4365] mb-2" />
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-lg font-bold text-gray-900">{listing.bathrooms}</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                  <Car className="w-8 h-8 text-[#2A4365] mb-2" />
                  <p className="text-sm text-gray-600">Parking</p>
                  <p className="text-lg font-bold text-gray-900">
                    {listing.parking ? "Yes" : "No"}
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                  <Sofa className="w-8 h-8 text-[#2A4365] mb-2" />
                  <p className="text-sm text-gray-600">Furnished</p>
                  <p className="text-lg font-bold text-gray-900">
                    {listing.furnished ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sticky Info Card */}
          <div className="lg:col-span-1">
            <InfoCard listing={listing} onInquire={() => setContact(true)} />
          </div>
        </div>

        {/* Similar Properties */}
        {similarListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <SectionHeader
              title="Similar Properties"
              subtitle="You might also be interested in these properties"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.map((similarListing, index) => (
                <PropertyCard
                  key={similarListing._id}
                  listing={similarListing}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        listing={listing}
        isOpen={contact}
        onClose={() => setContact(false)}
        onSuccess={() => {
          setContact(false);
        }}
      />
    </div>
  );
}
