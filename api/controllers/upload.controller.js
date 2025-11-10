import { errorHandler } from "../utils/error.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { uploadStream, isCloudinaryConfigured } from "../utils/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload file (images or documents)
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(errorHandler(400, "No file uploaded"));
    }

    if (isCloudinaryConfigured()) {
      // Upload to Cloudinary
      try {
        // Get folder from query params (e.g., ?folder=users for user avatars)
        const folder = req.query.folder || req.body.folder;
        const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "PropEase";
        const uploadFolder = folder ? `${baseFolder}/${folder}` : baseFolder;

        const result = await uploadStream(req.file.buffer, {
          folder: uploadFolder,
        });
        
        res.status(200).json({
          success: true,
          files: [
            {
              url: result.secure_url,
              public_id: result.public_id,
              originalname: req.file.originalname,
              size: req.file.size,
            },
          ],
        });
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        let errorMessage = "Failed to upload file to Cloudinary";
        if (cloudinaryError.message) {
          errorMessage = cloudinaryError.message;
        } else if (cloudinaryError.http_code === 400) {
          errorMessage = "Invalid file format or file too large";
        } else if (cloudinaryError.http_code === 413) {
          errorMessage = "File size exceeds maximum limit (5MB)";
        }
        return next(errorHandler(500, errorMessage));
      }
    } else {
      // Fallback to local storage
      console.log("Cloudinary not configured, using local storage");
      const fileUrl = `/uploads/${req.file.filename}`;
      res.status(200).json({
        success: true,
        files: [
          {
            url: fileUrl,
            public_id: null,
            originalname: req.file.originalname,
            size: req.file.size,
          },
        ],
      });
    }
  } catch (error) {
    next(error);
  }
};

// Upload multiple files
export const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(errorHandler(400, "No files uploaded"));
    }

    if (isCloudinaryConfigured()) {
      // Upload all files to Cloudinary
      try {
        const uploadPromises = req.files.map((file) => uploadStream(file.buffer));
        const results = await Promise.all(uploadPromises);

        const files = results.map((result, index) => ({
          url: result.secure_url,
          public_id: result.public_id,
          originalname: req.files[index].originalname,
          size: req.files[index].size,
        }));

        res.status(200).json({
          success: true,
          files: files,
        });
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        let errorMessage = "Failed to upload files to Cloudinary";
        if (cloudinaryError.message) {
          errorMessage = cloudinaryError.message;
        } else if (cloudinaryError.http_code === 400) {
          errorMessage = "Invalid file format or file too large";
        } else if (cloudinaryError.http_code === 413) {
          errorMessage = "File size exceeds maximum limit (5MB)";
        }
        return next(errorHandler(500, errorMessage));
      }
    } else {
      // Fallback to local storage
      console.log("Cloudinary not configured, using local storage");
      const files = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        public_id: null,
        originalname: file.originalname,
        size: file.size,
      }));

      res.status(200).json({
        success: true,
        files: files,
      });
    }
  } catch (error) {
    next(error);
  }
};

