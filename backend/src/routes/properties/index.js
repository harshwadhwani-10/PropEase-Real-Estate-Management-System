import express from "express";
import multer from "multer";
import {
  getProperties,
  getMyProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  addImagesProperty,
  deleteImagesProperty,
} from "../../controllers/properties/index.js";
import { verifyToken } from "../../middlewares/auth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.get("/", getProperties);
router.get("/me", verifyToken, getMyProperties);
router.get("/:id", getProperty);
router.post("/", verifyToken, createProperty);
router.patch("/:id", updateProperty);
router.delete("/:id", deleteProperty);
router.post("/upload/images/:id", verifyToken, upload.array('images', 10), addImagesProperty);
router.delete("/upload/images/:id", verifyToken, deleteImagesProperty);

export default router;
