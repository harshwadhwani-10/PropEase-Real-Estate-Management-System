import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

console.log("Cloudinary ENV:", {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  API_KEY: process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing",
  API_SECRET: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing",
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file stream to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {Object} opts - Upload options (folder, resource_type, etc.)
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadStream = async (fileBuffer, opts = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "PropEase",
      resource_type: "auto", // Auto-detect image, video, raw
      ...opts,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    // Convert buffer to stream
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} public_id - Cloudinary public_id
 * @returns {Promise<Object>}
 */
export const destroy = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} - public_id or null if not a Cloudinary URL
 */
export const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Check if it's a Cloudinary URL
  if (!url.includes("cloudinary.com")) {
    return null;
  }

  try {
    // Pattern 1: /image/upload/v{version}/{folder}/{filename}.{ext}
    // Pattern 2: /image/upload/{folder}/{filename}.{ext}
    // We want to extract everything after /image/upload/ (including version if present)
    
    // First, try to match with version number
    const withVersionRegex = /\/image\/upload\/v\d+\/(.+?)(?:\.[^./?#]+)?(?:\?|$|#)/;
    const withVersionMatch = url.match(withVersionRegex);
    
    if (withVersionMatch && withVersionMatch[1]) {
      // Remove any query parameters and return the public_id
      return withVersionMatch[1].split('?')[0];
    }

    // Try without version number
    const withoutVersionRegex = /\/image\/upload\/(.+?)(?:\.[^./?#]+)?(?:\?|$|#)/;
    const withoutVersionMatch = url.match(withoutVersionRegex);
    
    if (withoutVersionMatch && withoutVersionMatch[1]) {
      return withoutVersionMatch[1].split('?')[0];
    }

    // Fallback: try to extract after /upload/
    const fallbackRegex = /\/upload\/(.+?)(?:\.[^./?#]+)?(?:\?|$|#)/;
    const fallbackMatch = url.match(fallbackRegex);
    
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1].split('?')[0];
    }
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
  }

  return null;
};

/**
 * Check if Cloudinary is configured
 * @returns {boolean}
 */
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

