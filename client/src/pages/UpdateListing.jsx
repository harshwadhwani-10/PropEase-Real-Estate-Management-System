import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
//Create Listing
export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
    documents: [],
    virtualTourUrl: "",
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await api.get(`/api/listing/get/${listingId}`);
      const data = res.data;
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setFormData(data);
    };

    fetchListing();
  }, []);
  //Handle Image Of Listing
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      setUploadProgress(0);

      try {
        const formDataUpload = new FormData();
        Array.from(files).forEach((file) => {
          formDataUpload.append("files", file);
        });

        const res = await api.post("/api/upload/multiple", formDataUpload, {
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

        if (res.data.success && res.data.files) {
          const urls = res.data.files.map((file) => file.url);
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setFiles([]); // Clear file input
          setImageUploadError(false);
        } else {
          setImageUploadError("Image upload failed");
        }
      } catch (err) {
        console.error("Upload error:", err);
        let errorMessage = "Image upload failed. Please try again.";
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.status === 400) {
          errorMessage = "Invalid file format. Please upload images only (JPG, PNG, WEBP).";
        } else if (err.response?.status === 413) {
          errorMessage = "File size too large. Maximum file size is 5MB per image.";
        } else if (err.message) {
          errorMessage = err.message;
        }
        setImageUploadError(errorMessage);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    } else {
      setImageUploadError("You can only upload 6 images per listing");
    }
  };
  //Handle Delete Image Of Listing
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };
  //Handle Image Of Listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");
      setLoading(true);
      setError(false);
      const res = await api.post(`/api/listing/update/${params.listingId}`, {
        ...formData,
        userRef: currentUser._id,
      });
      const data = res.data;
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
        return;
      }
      // Check if listing is pending approval
      if (data.status === "pending") {
        alert("Listing updated successfully! It is pending admin approval. You will be redirected to your listings.");
        navigate("/owner/listings");
      } else {
        navigate(`/listing/${data._id}`);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <main className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center my-3 sm:my-4 lg:my-7 text-gray-800">
        Update a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-4 sm:gap-6">
        <div className="flex flex-col gap-3 sm:gap-4 flex-1 bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Modern Downtown Apartment"
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
              id="name"
              maxLength="62"
              minLength="10"
              required
              onChange={handleChange}
              value={formData.name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              placeholder="Describe your property in detail..."
              className="border p-3 rounded-lg w-full min-h-[120px] focus:outline-none focus:ring-2 focus:ring-slate-500"
              id="description"
              required
              onChange={handleChange}
              value={formData.description}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              placeholder="Full address including city and state"
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
              id="address"
              required
              onChange={handleChange}
              value={formData.address}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  id="sale"
                  className="w-4 h-4"
                  onChange={handleChange}
                  checked={formData.type === "sale"}
                />
                <span className="text-gray-700">For Sale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  id="rent"
                  className="w-4 h-4"
                  onChange={handleChange}
                  checked={formData.type === "rent"}
                />
                <span className="text-gray-700">For Rent</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="parking"
                  className="w-4 h-4"
                  onChange={handleChange}
                  checked={formData.parking}
                />
                <span className="text-gray-700">Parking Spot</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="furnished"
                  className="w-4 h-4"
                  onChange={handleChange}
                  checked={formData.furnished}
                />
                <span className="text-gray-700">Furnished</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="offer"
                  className="w-4 h-4"
                  onChange={handleChange}
                  checked={formData.offer}
                />
                <span className="text-gray-700">Special Offer</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms *
              </label>
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
                onChange={handleChange}
                value={formData.bedrooms}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms *
              </label>
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
                onChange={handleChange}
                value={formData.bathrooms}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regular Price * {formData.type === "rent" && <span className="text-xs text-gray-500">(₹ / month)</span>}
              </label>
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
                onChange={handleChange}
                value={formData.regularPrice}
              />
            </div>
            {formData.offer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discounted Price * {formData.type === "rent" && <span className="text-xs text-gray-500">(₹ / month)</span>}
                </label>
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-3 sm:gap-4 bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Virtual Tour URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/virtual-tour"
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
              id="virtualTourUrl"
              onChange={handleChange}
              value={formData.virtualTourUrl}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Images *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              The first image will be the cover (max 6 images)
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                onChange={(e) => setFiles(e.target.files)}
                className="p-3 border border-gray-300 rounded-lg w-full sm:flex-1 focus:outline-none focus:ring-2 focus:ring-slate-500"
                type="file"
                id="images"
                accept="image/*"
                multiple
                disabled={uploading}
              />
              <button
                type="button"
                disabled={uploading || files.length === 0}
                onClick={handleImageSubmit}
                className="p-3 bg-green-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-50 transition-opacity font-semibold whitespace-nowrap"
              >
                {uploading ? `Uploading ${uploadProgress}%` : "Upload"}
              </button>
            </div>
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            {imageUploadError && (
              <p className="text-red-700 text-sm mt-2 font-semibold">
                {imageUploadError}
              </p>
            )}
          </div>

          {/* Image Previews */}
          {formData.imageUrls.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uploaded Images ({formData.imageUrls.length}/6)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {formData.imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className="relative border rounded-lg overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt={`listing image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded hover:opacity-90 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading || formData.imageUrls.length === 0}
            className="w-full p-2.5 sm:p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-50 transition-opacity font-semibold text-sm sm:text-base lg:text-lg mt-3 sm:mt-4"
          >
            {loading ? "Updating..." : "Update Listing"}
          </button>
          {error && (
            <p className="text-red-700 text-sm text-center font-semibold">
              {error}
            </p>
          )}
        </div>
      </form>
    </main>
  );
}
