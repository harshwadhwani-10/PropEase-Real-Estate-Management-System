import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import ListingItem from "../components/ListingItem";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle Avatar Upload using Cloudinary
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setFileUploadError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFileUploadError("File size too large. Maximum file size is 5MB.");
      return;
    }

    setUploading(true);
    setFileUploadError(false);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      // Add folder parameter for user avatars
      formDataUpload.append("folder", "users");

      const res = await api.post("/api/upload/single?folder=users", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (res.data.success && res.data.files && res.data.files.length > 0) {
        const newAvatarUrl = res.data.files[0].url;
        setFormData({ ...formData, avatar: newAvatarUrl });
        setFileUploadError(false);
      } else {
        setFileUploadError("Image upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      let errorMessage = "Image upload failed. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid file format. Please upload images only (JPG, PNG, WEBP).";
      } else if (err.response?.status === 413) {
        errorMessage = "File size too large. Maximum file size is 5MB.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setFileUploadError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleFileUpload(selectedFile);
    }
  };

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.id]: e.target.value 
    });
    // Clear error when user starts typing
    if (error) {
      dispatch(updateUserFailure(null));
    }
  };

  //Handle-Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      
      // Build update object - include fields that are in formData or avatar
      const updateData = {};
      
      // Username - only update if it's different
      if (formData.username !== undefined && formData.username.trim() !== "" && formData.username !== currentUser.username) {
        updateData.username = formData.username.trim();
      }
      
      // Email - only update if it's different
      if (formData.email !== undefined && formData.email.trim() !== "" && formData.email !== currentUser.email) {
        updateData.email = formData.email.trim();
      }
      
      // Password - only update if provided and not empty
      if (formData.password !== undefined && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }
      
      // Avatar - update if changed or if a new avatar was uploaded
      if (formData.avatar) {
        if (formData.avatar !== currentUser.avatar) {
          updateData.avatar = formData.avatar;
        }
      }

      // If no changes, show message and return
      if (Object.keys(updateData).length === 0) {
        dispatch(updateUserFailure("No changes to update. Please modify at least one field."));
        return;
      }

      const res = await api.post(`/api/user/update/${currentUser._id}`, updateData);
      const data = res.data;
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      // Clear form data after successful update
      // If avatar was updated, it will be in the response data, so we can clear formData
      setFormData({});
    } catch (error) {
      dispatch(updateUserFailure(error.response?.data?.message || error.message || "Failed to update profile"));
    }
  };

  //Delete-User
  const handleDeleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    try {
      dispatch(deleteUserStart());
      const res = await api.delete(`/api/user/delete/${currentUser._id}`);
      const data = res.data;
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  //Sign-Out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await api.get("/api/auth/signout");
      const data = res.data;
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  //Show-Listings
  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await api.get(`/api/user/listings/${currentUser._id}`);
      const data = res.data;
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  /* Handle Listing Delete */
  const handleListingDelete = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }
    try {
      const res = await api.delete(`/api/listing/delete/${listingId}`);
      const data = res.data;
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-center my-4 sm:my-7 text-gray-800">
        Profile
      </h1>

      {/* Profile Update Form */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <input
              onChange={handleFileChange}
              type="file"
              ref={fileRef}
              hidden
              accept="image/*"
            />
            <img
              onClick={() => fileRef.current.click()}
              src={formData.avatar || currentUser.avatar}
              alt="profile"
              className="rounded-full h-20 w-20 sm:h-24 sm:w-24 object-cover cursor-pointer border-2 border-gray-300 hover:border-slate-700 transition-colors"
            />
            <p className="text-xs sm:text-sm text-center">
              {fileUploadError ? (
                <span className="text-red-700 font-semibold">
                  {fileUploadError}
                </span>
              ) : uploading ? (
                <span className="text-slate-700">
                  Uploading {uploadProgress}%
                </span>
              ) : formData.avatar ? (
                <span className="text-green-700">Image ready to upload!</span>
              ) : (
                <span className="text-gray-500">Click to change profile picture</span>
              )}
            </p>
            {uploading && (
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="username"
                defaultValue={currentUser.username}
                id="username"
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="email"
                id="email"
                defaultValue={currentUser.email}
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password (leave blank to keep current password)
            </label>
            <input
              type="password"
              placeholder="password"
              onChange={handleChange}
              id="password"
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80 transition-opacity font-semibold"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
            {(currentUser.role === "owner" || currentUser.role === "admin") && (
              <Link
                to="/owner/create-listing"
                className="flex-1 bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95 transition-opacity font-semibold"
              >
                Create Listing
              </Link>
            )}
          </div>

          {/* Success/Error Messages */}
          {updateSuccess && (
            <p className="text-green-700 text-center font-semibold">
              Profile updated successfully!
            </p>
          )}
          {error && (
            <p className="text-red-700 text-center font-semibold">{error}</p>
          )}
        </form>

        {/* Account Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleDeleteUser}
            className="text-red-700 hover:text-red-900 font-semibold transition-colors"
          >
            Delete Account
          </button>
          <button
            onClick={handleSignOut}
            className="text-red-700 hover:text-red-900 font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* User Listings */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Your Listings
          </h2>
          <button
            onClick={handleShowListings}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:opacity-95 transition-opacity text-sm sm:text-base"
          >
            {userListings.length > 0 ? "Refresh" : "Show Listings"}
          </button>
        </div>

        {showListingsError && (
          <p className="text-red-700 text-center mb-4">
            Error loading listings. Please try again.
          </p>
        )}

        {userListings && userListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white"
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt="listing cover"
                    className="h-48 w-full object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link
                    className="text-slate-700 font-semibold hover:underline block mb-2 truncate"
                    to={`/listing/${listing._id}`}
                  >
                    {listing.name}
                  </Link>
                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/update-listing/${listing._id}`}
                      className="flex-1 bg-slate-200 text-slate-700 px-3 py-2 rounded text-center hover:opacity-95 transition-opacity text-sm font-semibold"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleListingDelete(listing._id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:opacity-95 transition-opacity text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No listings found. Create your first listing!
          </p>
        )}
      </div>
    </div>
  );
}
