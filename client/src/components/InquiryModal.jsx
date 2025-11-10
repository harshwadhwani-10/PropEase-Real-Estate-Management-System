import { useState } from "react";
import PropTypes from "prop-types";
import api from "../utils/api";
import { FaEnvelope, FaCheckCircle, FaTimes, FaPhone } from "react-icons/fa";

const InquiryModal = ({ listing, isOpen, onClose, onSuccess }) => {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.post("/api/inquiry/create", {
        listingId: listing._id,
        message: message.trim(),
        phone: phone.trim(),
      });

      if (res.data.success) {
        setSuccess(true);
        setMessage("");
        setPhone("");
        setTimeout(() => {
          setSuccess(false);
          onSuccess && onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
      setError(
        error.response?.data?.message || "Failed to send inquiry. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ overflow: 'auto' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
        style={{ maxWidth: 'calc(100% - 2rem)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words pr-2">Inquire About Property</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            disabled={submitting}
            type="button"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1" style={{ overflowX: 'hidden' }}>
          {/* Property Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2 break-words">{listing.name}</h3>
            <p className="text-sm text-gray-600 break-words">{listing.address}</p>
            <p className="text-lg font-bold text-green-700 mt-2">
              ₹
              {listing.offer
                ? listing.discountPrice.toLocaleString("en-IN")
                : listing.regularPrice.toLocaleString("en-IN")}
              {listing.type === "rent" && " / month"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-slate-500 box-border"
                style={{ maxWidth: '100%' }}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Message *
              </label>
              <textarea
                name="message"
                id="message"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your inquiry message here... Tell the owner about your interest in this property."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none box-border"
                required
                style={{ maxWidth: '100%', wordWrap: 'break-word', overflowWrap: 'break-word' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length} characters
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <FaCheckCircle />
                <span>Inquiry sent successfully! The owner will be notified via email.</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim() || success}
                className="flex-1 bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-95 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : success ? (
                  <>
                    <FaCheckCircle />
                    Sent!
                  </>
                ) : (
                  <>
                    <FaEnvelope />
                    Send Inquiry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

InquiryModal.propTypes = {
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    offer: PropTypes.bool,
    discountPrice: PropTypes.number,
    regularPrice: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default InquiryModal;

