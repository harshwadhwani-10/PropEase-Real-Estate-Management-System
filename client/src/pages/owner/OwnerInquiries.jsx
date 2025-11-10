import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaList, FaPlus, FaUser, FaEnvelope, FaEye } from "react-icons/fa";
import api from "../../utils/api";
import DashboardLayout from "../../components/DashboardLayout";
import { Link } from "react-router-dom";
import InquiryDetailModal from "../../components/InquiryDetailModal";

const menuItems = [
  { path: "/owner/dashboard", label: "Dashboard", icon: FaHome },
  { path: "/owner/listings", label: "My Listings", icon: FaList },
  { path: "/owner/create-listing", label: "Create Listing", icon: FaPlus },
  { path: "/owner/inquiries", label: "Inquiries", icon: FaEnvelope },
  { path: "/owner/profile", label: "Profile", icon: FaUser },
];

export default function OwnerInquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, read, replied
  const [processingStatus, setProcessingStatus] = useState({});
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await api.get("/api/inquiry/owner");
        setInquiries(res.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const handleStatusUpdate = async (inquiryId, newStatus) => {
    setProcessingStatus((prev) => ({ ...prev, [inquiryId]: true }));
    try {
      const res = await api.patch(`/api/inquiry/${inquiryId}/status`, { status: newStatus });
      if (res.data.success) {
        setInquiries(
          inquiries.map((inq) =>
            inq._id === inquiryId ? { ...inq, status: newStatus } : inq
          )
        );
        // Update selected inquiry if it's the one being updated
        if (selectedInquiry && selectedInquiry._id === inquiryId) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      alert(error.response?.data?.message || "Failed to update inquiry status");
    } finally {
      setProcessingStatus((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

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
      <DashboardLayout menuItems={menuItems} title="Owner Panel">
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Loading inquiries...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} title="Owner Panel">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Property Inquiries</h1>
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
            <FaEnvelope className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl mb-2">No inquiries found</p>
            <p className="text-gray-400 text-sm">
              {filter === "all"
                ? "You haven't received any inquiries yet"
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
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-95 transition-opacity text-center text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <FaEye />
                      View Details
                    </button>
                    <Link
                      to={`/listing/${inquiry.listingId?._id}`}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:opacity-95 transition-opacity text-center text-sm font-semibold"
                    >
                      View Property
                    </Link>
                    <a
                      href={`mailto:${inquiry.userId?.email}?subject=Re: ${inquiry.listingId?.name}`}
                      className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:opacity-95 transition-opacity text-center text-sm font-semibold"
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inquiry Detail Modal */}
        {selectedInquiry && (
          <InquiryDetailModal
            inquiry={selectedInquiry}
            isOpen={!!selectedInquiry}
            onClose={() => setSelectedInquiry(null)}
            onStatusUpdate={handleStatusUpdate}
            processingStatus={processingStatus}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

