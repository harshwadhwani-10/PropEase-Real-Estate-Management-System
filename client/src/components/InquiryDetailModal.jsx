import PropTypes from "prop-types";
import { FaTimes, FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const InquiryDetailModal = ({ inquiry, isOpen, onClose, onStatusUpdate, processingStatus }) => {
  if (!isOpen || !inquiry) return null;

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      read: "bg-blue-100 text-blue-800",
      replied: "bg-green-100 text-green-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Inquiry Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-start">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(inquiry.status)}`}>
              {inquiry.status.toUpperCase()}
            </span>
          </div>

          {/* Inquirer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Inquirer Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {inquiry.userId?.avatar && (
                  <img
                    src={inquiry.userId.avatar}
                    alt={inquiry.userId.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{inquiry.userId?.username || "Unknown User"}</p>
                  <p className="text-sm text-gray-600">{inquiry.userId?.email || "No email"}</p>
                </div>
              </div>
              {inquiry.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FaPhone className="text-gray-500" />
                  <span>{inquiry.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Information</h3>
            <div className="space-y-3">
              <Link
                to={`/listing/${inquiry.listingId?._id}`}
                className="text-blue-600 hover:underline font-semibold text-lg block"
              >
                {inquiry.listingId?.name || "Property"}
              </Link>
              {inquiry.listingId?.address && (
                <div className="flex items-start gap-2 text-gray-700">
                  <FaMapMarkerAlt className="text-gray-500 mt-1" />
                  <span>{inquiry.listingId.address}</span>
                </div>
              )}
              {inquiry.listingId?.imageUrls?.[0] && (
                <img
                  src={inquiry.listingId.imageUrls[0]}
                  alt={inquiry.listingId.name}
                  className="w-full h-48 object-cover rounded-lg mt-2"
                />
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Message</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap break-words">{inquiry.message}</p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaCalendarAlt />
            <span>Received: {new Date(inquiry.createdAt).toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              {/* Primary Actions Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${inquiry.userId?.email}?subject=Re: ${encodeURIComponent(inquiry.listingId?.name || "Property Inquiry")}&body=Hello ${encodeURIComponent(inquiry.userId?.username || "there")},%0D%0A%0D%0AThank you for your inquiry about ${encodeURIComponent(inquiry.listingId?.name || "the property")}.%0D%0A%0D%0A`}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:opacity-95 transition-opacity text-center font-semibold flex items-center justify-center gap-2 min-h-[44px]"
                  style={{ lineHeight: '1.5' }}
                >
                  <FaEnvelope />
                  <span>Reply via Email</span>
                </a>
                <Link
                  to={`/listing/${inquiry.listingId?._id}`}
                  className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg hover:opacity-95 transition-opacity text-center font-semibold flex items-center justify-center min-h-[44px]"
                  style={{ lineHeight: '1.5' }}
                >
                  View Property
                </Link>
              </div>

              {/* Status Update Actions Row */}
              {(inquiry.status === "pending" || inquiry.status !== "replied") && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {inquiry.status === "pending" && (
                    <button
                      onClick={() => onStatusUpdate(inquiry._id, "read")}
                      disabled={processingStatus[inquiry._id]}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-semibold min-h-[44px]"
                      style={{ lineHeight: '1.5' }}
                    >
                      {processingStatus[inquiry._id] ? "Updating..." : "Mark as Read"}
                    </button>
                  )}
                  {inquiry.status !== "replied" && (
                    <button
                      onClick={() => onStatusUpdate(inquiry._id, "replied")}
                      disabled={processingStatus[inquiry._id]}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-semibold min-h-[44px]"
                      style={{ lineHeight: '1.5' }}
                    >
                      {processingStatus[inquiry._id] ? "Updating..." : "Mark as Replied"}
                    </button>
                  )}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold min-h-[44px]"
                style={{ lineHeight: '1.5' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

InquiryDetailModal.propTypes = {
  inquiry: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    phone: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    userId: PropTypes.shape({
      username: PropTypes.string,
      email: PropTypes.string,
      avatar: PropTypes.string,
    }),
    listingId: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string,
      imageUrls: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
  processingStatus: PropTypes.object,
};

export default InquiryDetailModal;

