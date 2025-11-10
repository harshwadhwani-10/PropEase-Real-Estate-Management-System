import { useEffect, useState } from "react";
import { FaHome, FaUsers, FaListAlt, FaBell } from "react-icons/fa";
import api from "../../utils/api";
import ListingItem from "../../components/ListingItem";
import DashboardLayout from "../../components/DashboardLayout";
import { Link } from "react-router-dom";

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: FaHome },
  { path: "/admin/users", label: "Manage Users", icon: FaUsers },
  { path: "/admin/listings", label: "Manage Listings", icon: FaListAlt },
  { path: "/admin/notifications", label: "Notifications", icon: FaBell },
];

export default function ManageListings() {
  const [pendingListings, setPendingListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [viewMode, setViewMode] = useState("pending"); // pending or all

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const [pendingRes, allRes] = await Promise.all([
          api.get("/api/admin/listings/pending"),
          api.get("/api/admin/listings/all"),
        ]);
        setPendingListings(pendingRes.data || []);
        setAllListings(allRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleApprove = async (listingId) => {
    setProcessing({ ...processing, [listingId]: true });
    try {
      await api.post(`/api/admin/listings/${listingId}/approve`);
      setPendingListings(pendingListings.filter((l) => l._id !== listingId));
    } catch (error) {
      console.error("Error approving listing:", error);
      alert("Failed to approve listing");
    } finally {
      setProcessing({ ...processing, [listingId]: false });
    }
  };

  const handleReject = async (listingId) => {
    if (!window.confirm("Are you sure you want to reject this listing?")) {
      return;
    }
    setProcessing({ ...processing, [listingId]: true });
    try {
      await api.post(`/api/admin/listings/${listingId}/reject`);
      setPendingListings(pendingListings.filter((l) => l._id !== listingId));
    } catch (error) {
      console.error("Error rejecting listing:", error);
      alert("Failed to reject listing");
    } finally {
      setProcessing({ ...processing, [listingId]: false });
    }
  };

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems} title="Admin Panel">
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Loading pending listings...</p>
        </div>
      </DashboardLayout>
    );
  }

  const displayListings = viewMode === "pending" ? pendingListings : allListings;

  return (
    <DashboardLayout menuItems={menuItems} title="Admin Panel">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Listings</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("pending")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Pending ({pendingListings.length})
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === "all"
                  ? "bg-slate-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Listings ({allListings.length})
            </button>
          </div>
        </div>

        {viewMode === "pending" ? (
          <p className="text-gray-600 mb-6">Pending listings awaiting approval</p>
        ) : (
          <p className="text-gray-600 mb-6">All properties with owner information</p>
        )}

        {displayListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-xl">
              {viewMode === "pending" ? "No pending listings" : "No listings found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayListings.map((listing) => (
              <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <ListingItem listing={listing} />
                <div className="p-4 sm:p-6">
                  {/* Owner Info */}
                  {listing.userRef && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Owner</p>
                      <div className="flex items-center gap-2">
                        {listing.userRef.avatar && (
                          <img
                            src={listing.userRef.avatar}
                            alt={listing.userRef.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <p className="text-sm font-semibold text-gray-800">
                          {listing.userRef.username || "Unknown"}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">{listing.userRef.email}</p>
                    </div>
                  )}

                  {/* Status Badge */}
                  {listing.status && (
                    <div className="mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          listing.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : listing.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {listing.status.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Actions for Pending */}
                  {viewMode === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleApprove(listing._id)}
                        disabled={processing[listing._id]}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:opacity-95 disabled:opacity-50 transition-opacity text-sm sm:text-base font-semibold"
                      >
                        {processing[listing._id] ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(listing._id)}
                        disabled={processing[listing._id]}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-95 disabled:opacity-50 transition-opacity text-sm sm:text-base font-semibold"
                      >
                        {processing[listing._id] ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
