import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaHome, FaList, FaPlus, FaUser, FaEnvelope } from "react-icons/fa";
import api from "../../utils/api";
import ListingItem from "../../components/ListingItem";
import DashboardLayout from "../../components/DashboardLayout";

const menuItems = [
  { path: "/owner/dashboard", label: "Dashboard", icon: FaHome },
  { path: "/owner/listings", label: "My Listings", icon: FaList },
  { path: "/owner/create-listing", label: "Create Listing", icon: FaPlus },
  { path: "/owner/inquiries", label: "Inquiries", icon: FaEnvelope },
  { path: "/owner/profile", label: "Profile", icon: FaUser },
];

export default function OwnerListings() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (!currentUser || !currentUser._id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch ALL listings and filter by userRef
        const res = await api.get("/api/listing/get?limit=1000&showAll=true");
        const allListings = res.data || [];
        const myListings = allListings.filter(
          (listing) => listing.userRef === currentUser._id
        );
        setListings(myListings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentUser]);

  const handleDelete = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await api.delete(`/api/listing/delete/${listingId}`);
      setListings(listings.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems} title="Owner Panel">
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Loading listings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} title="Owner Panel">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>
          <button
            onClick={() => navigate("/owner/create-listing")}
            className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:opacity-95 transition-opacity"
          >
            Create New Listing
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-xl mb-4">No listings found</p>
            <button
              onClick={() => navigate("/owner/create-listing")}
              className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:opacity-95 transition-opacity"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {listings.map((listing) => (
              <div key={listing._id} className="border rounded-lg overflow-hidden shadow-md bg-white">
                <ListingItem listing={listing} />
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        listing.status
                      )}`}
                    >
                      {listing.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/update-listing/${listing._id}`)}
                      className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded hover:opacity-95 transition-opacity"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:opacity-95 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
