import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaUsers, FaListAlt, FaBell } from "react-icons/fa";
import api from "../../utils/api";
import DashboardLayout from "../../components/DashboardLayout";

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: FaHome },
  { path: "/admin/users", label: "Manage Users", icon: FaUsers },
  { path: "/admin/listings", label: "Manage Listings", icon: FaListAlt },
  { path: "/admin/notifications", label: "Notifications", icon: FaBell },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    owners: 0,
    buyers: 0,
    admins: 0,
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    recentSignups: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users
        const usersRes = await api.get("/api/user/all");
        const users = usersRes.data || [];

        // Fetch listings (all statuses)
        const listingsRes = await api.get("/api/listing/get?limit=1000&showAll=true");
        const listings = listingsRes.data || [];

        // Calculate stats
        setStats({
          totalUsers: users.length,
          owners: users.filter((u) => u.role === "owner").length,
          buyers: users.filter((u) => u.role === "buyer").length,
          admins: users.filter((u) => u.role === "admin").length,
          totalListings: listings.length,
          pendingListings: listings.filter((l) => l.status === "pending").length,
          approvedListings: listings.filter((l) => l.status === "approved").length,
          recentSignups: users
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB - dateA;
            })
            .slice(0, 5),
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems} title="Admin Panel">
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} title="Admin Panel">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-slate-700">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Owners</h3>
            <p className="text-3xl font-bold text-indigo-700">{stats.owners}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Buyers</h3>
            <p className="text-3xl font-bold text-green-700">{stats.buyers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Admins</h3>
            <p className="text-3xl font-bold text-purple-700">{stats.admins}</p>
          </div>
        </div>

        {/* Listing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-slate-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Listings</h3>
            <p className="text-3xl font-bold text-slate-700">{stats.totalListings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending Approval</h3>
            <p className="text-3xl font-bold text-yellow-700">{stats.pendingListings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-700">{stats.approvedListings}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:opacity-95 transition-opacity"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate("/admin/listings")}
              className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:opacity-95 transition-opacity"
            >
              Manage Listings
            </button>
          </div>
        </div>

        {/* Recent Signups */}
        {stats.recentSignups.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Signups</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-gray-600">Username</th>
                    <th className="text-left p-2 text-gray-600">Email</th>
                    <th className="text-left p-2 text-gray-600">Role</th>
                    <th className="text-left p-2 text-gray-600">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSignups.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
