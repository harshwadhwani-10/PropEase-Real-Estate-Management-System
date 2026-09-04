import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import axios from "axios";
import { FaGoogle } from "react-icons/fa";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get("next");
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("buyer");
  const [googleUser, setGoogleUser] = useState(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // Fetch user profile from Google using the access token
        const userInfoRes = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const { name, email, picture } = userInfoRes.data;

        // Check if user exists
        try {
          const checkRes = await api.get(
            `/api/user/check-email?email=${encodeURIComponent(email)}`
          );

          if (checkRes.data.exists) {
            // User exists, sign in directly
            const signInRes = await api.post("/api/auth/google", {
              name,
              email,
              photo: picture,
            });
            dispatch(signInSuccess(signInRes.data));
            navigate(nextUrl || "/");
          } else {
            // User doesn't exist, show role selection modal
            setGoogleUser({
              name,
              email,
              photo: picture,
            });
            setShowRoleModal(true);
          }
        } catch (checkError) {
          // If check fails or not found, show role modal
          setGoogleUser({
            name,
            email,
            photo: picture,
          });
          setShowRoleModal(true);
        }
      } catch (error) {
        console.error("Google sign-in error:", error);
        alert(error.response?.data?.message || "Failed to sign in with Google");
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google login error:", errorResponse);
      setLoading(false);
      alert("Google sign in failed. Please check your Google credentials and try again.");
    },
  });

  const handleRoleSubmit = async () => {
    if (!googleUser) return;

    try {
      setLoading(true);
      const res = await api.post("/api/auth/google", {
        name: googleUser.name,
        email: googleUser.email,
        photo: googleUser.photo,
        role: selectedRole,
      });
      dispatch(signInSuccess(res.data));
      setShowRoleModal(false);
      navigate(nextUrl || "/");
    } catch (error) {
      console.error("Error creating user with Google:", error);
      alert(error.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setLoading(true);
          googleLogin();
        }}
        type="button"
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <FaGoogle className="text-xl text-red-600" />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Your Role</h2>
            <p className="text-gray-600 mb-6">
              Choose how you want to use our platform:
            </p>

            <div className="space-y-3 mb-6">
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedRole === "buyer"
                    ? "border-slate-700 bg-slate-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={selectedRole === "buyer"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Buy Properties</p>
                  <p className="text-sm text-gray-600">
                    Browse and inquire about properties
                  </p>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedRole === "owner"
                    ? "border-slate-700 bg-slate-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={selectedRole === "owner"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">List Properties</p>
                  <p className="text-sm text-gray-600">
                    Create and manage property listings
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setGoogleUser(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleSubmit}
                disabled={loading}
                className="flex-1 bg-slate-700 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-95 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Creating Account..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
