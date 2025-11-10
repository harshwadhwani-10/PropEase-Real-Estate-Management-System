import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaUsers, FaListAlt, FaBell, FaEye, FaTrash } from "react-icons/fa";
import api from "../../utils/api";
import DashboardLayout from "../../components/DashboardLayout";

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: FaHome },
  { path: "/admin/users", label: "Manage Users", icon: FaUsers },
  { path: "/admin/listings", label: "Manage Listings", icon: FaListAlt },
  { path: "/admin/notifications", label: "Notifications", icon: FaBell },
];

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/api/user/all");
        setUsers(res.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting({ ...deleting, [userId]: true });
    try {
      await api.delete(`/api/user/delete/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setDeleting({ ...deleting, [userId]: false });
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: "bg-purple-100 text-purple-800",
      owner: "bg-blue-100 text-blue-800",
      buyer: "bg-green-100 text-green-800",
    };
    return badges[role] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems} title="Admin Panel">
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Loading users...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} title="Admin Panel">
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Manage Users</h1>

        {/* User Info Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">User Information</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Username:</label>
                  <p className="text-gray-800">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Email:</label>
                  <p className="text-gray-800">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Role:</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Joined:</label>
                  <p className="text-gray-800">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:opacity-95 transition-opacity"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-gray-600 font-semibold text-sm sm:text-base">Username</th>
                  <th className="text-left p-3 sm:p-4 text-gray-600 font-semibold text-sm sm:text-base hidden sm:table-cell">Email</th>
                  <th className="text-left p-3 sm:p-4 text-gray-600 font-semibold text-sm sm:text-base">Role</th>
                  <th className="text-left p-3 sm:p-4 text-gray-600 font-semibold text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 sm:p-4 text-sm sm:text-base">{user.username}</td>
                    <td className="p-3 sm:p-4 text-sm sm:text-base hidden sm:table-cell">{user.email}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded hover:opacity-95 transition-opacity text-xs sm:text-sm"
                          title="View User Info"
                        >
                          <FaEye className="inline mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.username)}
                          disabled={deleting[user._id]}
                          className="bg-red-600 text-white px-3 py-1.5 rounded hover:opacity-95 disabled:opacity-50 transition-opacity text-xs sm:text-sm"
                          title="Delete User"
                        >
                          <FaTrash className="inline mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
