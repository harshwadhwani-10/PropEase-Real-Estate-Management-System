import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import api from "../utils/api";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";

const Contact = ({ listing }) => {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onChange = (e) => {
    if (e.target.id === "message") {
      setMessage(e.target.value);
    } else if (e.target.id === "phone") {
      setPhone(e.target.value);
    }
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await api.get(`/api/user/${listing.userRef}`);
        const data = res.data;
        setLandlord(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError("Error fetching landlord information");
        setLoading(false);
      }
    };

    fetchLandlord();
  }, [listing.userRef]);

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
        }, 5000);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
        Inquire About This Property
      </h2>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error && !landlord ? (
        <p className="text-red-600">Error: {error}</p>
      ) : (
        landlord && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="text-gray-700 mb-2">
                Contact <span className="font-semibold">{landlord.username}</span>{" "}
                for{" "}
                <span className="font-semibold">
                  {listing.name}
                </span>
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={onChange}
                placeholder="Enter your phone number"
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                id="message"
                rows="4"
                value={message}
                onChange={onChange}
                placeholder="Enter your inquiry message here..."
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>

            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <FaCheckCircle />
                <span>Inquiry sent successfully! The owner will be notified via email.</span>
              </div>
            )}

            {error && error !== "Error fetching landlord information" && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95 disabled:opacity-50 transition-opacity font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                "Sending..."
              ) : (
                <>
                  <FaEnvelope />
                  Send Inquiry
                </>
              )}
            </button>
          </form>
        )
      )}
    </div>
  );
};

Contact.propTypes = {
  listing: PropTypes.shape({
    userRef: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default Contact;
