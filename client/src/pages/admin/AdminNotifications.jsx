import { useEffect, useState } from "react";
import { FaHome, FaUsers, FaListAlt, FaBell } from "react-icons/fa";
import api from "../../utils/api";
import DashboardLayout from "../../components/DashboardLayout";
import { Link } from "react-router-dom";

const getRoleBadge = (role) => {
  const badges = {
    admin: "bg-purple-100 text-purple-800",
    owner: "bg-blue-100 text-blue-800",
    buyer: "bg-green-100 text-green-800",
  };
  return badges[role] || "bg-gray-100 text-gray-800";
};

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: FaHome },
  { path: "/admin/users", label: "Manage Users", icon: FaUsers },
  { path: "/admin/listings", label: "Manage Listings", icon: FaListAlt },
  { path: "/admin/notifications", label: "Notifications", icon: FaBell },
];

export default function AdminNotifications() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, read, replied
  const [selectedOwner, setSelectedOwner] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await api.get("/api/admin/inquiries");
        setInquiries(res.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      read: "bg-blue-100 text-blue-800",
      replied: "bg-green-100 text-green-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter === "all") return true;
    return inq.status === filter;
  });

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems} title="Admin Panel">
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Loading notifications...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} title="Admin Panel">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <span className="text-gray-600">
            Total Inquiries: {inquiries.length}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === "all"
                ? "border-b-2 border-slate-700 text-slate-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All ({inquiries.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === "pending"
                ? "border-b-2 border-yellow-600 text-yellow-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending ({inquiries.filter((i) => i.status === "pending").length})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === "read"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Read ({inquiries.filter((i) => i.status === "read").length})
          </button>
          <button
            onClick={() => setFilter("replied")}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === "replied"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Replied ({inquiries.filter((i) => i.status === "replied").length})
          </button>
        </div>

        {/* Inquiries List */}
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FaBell className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl mb-2">No notifications found</p>
            <p className="text-gray-400 text-sm">
              {filter === "all"
                ? "No inquiries have been made yet"
                : `No ${filter} inquiries`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left Side - Inquiry Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <img
                        src={inquiry.userId?.avatar || "https://via.placeholder.com/50"}
                        alt={inquiry.userId?.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {inquiry.userId?.username || "Unknown User"}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              inquiry.status
                            )}`}
                          >
                            {inquiry.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Inquired about property owned by{" "}
                          <span className="font-semibold">
                            {inquiry.ownerId?.username || "Unknown Owner"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {inquiry.userId?.email || "No email"}
                        </p>
                        {inquiry.phone && (
                          <p className="text-sm text-gray-600 mb-2">Phone: {inquiry.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Property Info */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <Link
                        to={`/listing/${inquiry.listingId?._id}`}
                        className="text-blue-600 hover:underline font-semibold mb-1 block"
                      >
                        {inquiry.listingId?.name || "Property"}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {inquiry.listingId?.address || "Address not available"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Owner: <span className="font-semibold">{inquiry.ownerId?.username || "Unknown"}</span>
                      </p>
                      {inquiry.listingId?.imageUrls?.[0] && (
                        <img
                          src={inquiry.listingId.imageUrls[0]}
                          alt={inquiry.listingId.name}
                          className="w-full h-32 object-cover rounded mt-2"
                        />
                      )}
                    </div>

                    {/* Message */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                      <p className="text-gray-600 whitespace-pre-wrap">{inquiry.message}</p>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400">
                      Received: {new Date(inquiry.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col gap-2 sm:min-w-[150px]">
                    <Link
                      to={`/listing/${inquiry.listingId?._id}`}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:opacity-95 transition-opacity text-center text-sm font-semibold"
                    >
                      View Property
                    </Link>
                    <button
                      onClick={() => setSelectedOwner(inquiry.ownerId)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-95 transition-opacity text-center text-sm font-semibold"
                    >
                      View Owner
                    </button>
                    <a
                      href={`mailto:${inquiry.userId?.email}?subject=Re: ${inquiry.listingId?.name}`}
                      className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:opacity-95 transition-opacity text-center text-sm font-semibold"
                    >
                      Contact Inquirer
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Owner Info Modal */}
        {selectedOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Owner Information</h2>
                <button
                  onClick={() => setSelectedOwner(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                {selectedOwner.avatar && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={selectedOwner.avatar}
                      alt={selectedOwner.username}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Username:</label>
                  <p className="text-gray-800">{selectedOwner.username || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Email:</label>
                  <p className="text-gray-800">{selectedOwner.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Role:</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(selectedOwner.role || "buyer")}`}>
                    {(selectedOwner.role || "buyer").toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <a
                  href={`mailto:${selectedOwner.email}`}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-95 transition-opacity text-center"
                >
                  Contact Owner
                </a>
                <button
                  onClick={() => setSelectedOwner(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:opacity-95 transition-opacity"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

