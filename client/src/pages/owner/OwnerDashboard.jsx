import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaHome, FaList, FaPlus, FaUser, FaEnvelope } from "react-icons/fa";
import api from "../../utils/api";
import DashboardLayout from "../../components/DashboardLayout";

const menuItems = [
  { path: "/owner/dashboard", label: "Dashboard", icon: FaHome },
  { path: "/owner/listings", label: "My Listings", icon: FaList },
  { path: "/owner/create-listing", label: "Create Listing", icon: FaPlus },
  { path: "/owner/inquiries", label: "Inquiries", icon: FaEnvelope },
  { path: "/owner/profile", label: "Profile", icon: FaUser },
];

export default function OwnerDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalListings: 0,
    approvedListings: 0,
    pendingListings: 0,
    rejectedListings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser || !currentUser._id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch ALL listings for this owner (including pending/rejected)
        // We need to get all listings and filter by userRef
        const res = await api.get("/api/listing/get?limit=1000&showAll=true");
        const allListings = res.data || [];
        const myListings = allListings.filter(
          (listing) => listing.userRef === currentUser._id
        );

        setStats({
          totalListings: myListings.length,
          approvedListings: myListings.filter((l) => l.status === "approved").length,
          pendingListings: myListings.filter((l) => l.status === "pending").length,
          rejectedListings: myListings.filter((l) => l.status === "rejected").length,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems} title="Owner Panel">
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} title="Owner Panel">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Listings</h3>
            <p className="text-3xl font-bold text-slate-700">{stats.totalListings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-700">{stats.approvedListings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-700">{stats.pendingListings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Rejected</h3>
            <p className="text-3xl font-bold text-red-700">{stats.rejectedListings}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate("/owner/create-listing")}
              className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:opacity-95 transition-opacity"
            >
              Create New Listing
            </button>
            <button
              onClick={() => navigate("/owner/listings")}
              className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:opacity-95 transition-opacity"
            >
              View My Listings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
