import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { isCloudinaryConfigured } from "./cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist (for local fallback only)
const uploadsDir = path.join(__dirname, "../uploads");
if (!process.env.VERCEL) {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {
    // ignore
  }
}

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images and documents
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDF/DOC files are allowed."), false);
  }
};

// Use memoryStorage for Cloudinary or Serverless (Vercel)
// Fallback to diskStorage only in local environment without Cloudinary
const storage =
  isCloudinaryConfigured() || process.env.VERCEL
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
        },
      });

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
export const uploadSingle = upload.single("file");

// Middleware for multiple files upload
export const uploadMultiple = upload.array("files", 10); // Max 10 files
