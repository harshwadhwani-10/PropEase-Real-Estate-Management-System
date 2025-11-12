import { useState } from "react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { FaGoogle } from "react-icons/fa";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get("next");
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("buyer");
  const [googleUser, setGoogleUser] = useState(null);

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      // Check if user exists
      try {
        const checkRes = await api.get(`/api/user/check-email?email=${encodeURIComponent(result.user.email)}`);
        
        if (checkRes.data.exists) {
          // User exists, sign in directly
          const signInRes = await api.post("/api/auth/google", {
            name: result.user.displayName,
            email: result.user.email,
            photo: result.user.photoURL,
          });
          const data = signInRes.data;
          dispatch(signInSuccess(data));
          // Redirect to next URL if provided, otherwise go to home
          const redirectTo = nextUrl || "/";
          navigate(redirectTo);
        } else {
          // User doesn't exist, show role selection modal
          setGoogleUser({
            name: result.user.displayName,
            email: result.user.email,
            photo: result.user.photoURL,
          });
          setShowRoleModal(true);
        }
      } catch (error) {
        // If check fails, assume new user and show role modal
        if (error.response?.status === 404) {
          setGoogleUser({
            name: result.user.displayName,
            email: result.user.email,
            photo: result.user.photoURL,
          });
          setShowRoleModal(true);
        } else {
          // Other error - try to sign in with default role
          console.error("Email check error:", error);
          try {
            const signInRes = await api.post("/api/auth/google", {
              name: result.user.displayName,
              email: result.user.email,
              photo: result.user.photoURL,
              role: "buyer",
            });
            const data = signInRes.data;
            dispatch(signInSuccess(data));
            // Redirect to next URL if provided, otherwise go to home
            const redirectTo = nextUrl || "/";
            navigate(redirectTo);
          } catch (signInError) {
            console.error("Sign-in error:", signInError);
            alert(signInError.response?.data?.message || "Failed to sign in with Google");
          }
        }
      }
    } catch (error) {
      console.error("Firebase authentication error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        // User closed the popup, no need to show error
      } else if (error.code === "auth/popup-blocked") {
        alert("Popup was blocked. Please allow popups for this site and try again.");
      } else if (error.code === "auth/unauthorized-domain") {
        alert("This domain is not authorized. Please check Firebase configuration.");
      } else if (error.code === "auth/network-request-failed") {
        alert("Network error. Please check your internet connection and try again.");
      } else {
        alert("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
      const data = res.data;
      dispatch(signInSuccess(data));
      setShowRoleModal(false);
      // Redirect to next URL if provided, otherwise go to home
      const redirectTo = nextUrl || "/";
      navigate(redirectTo);
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
        onClick={handleGoogleClick}
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
