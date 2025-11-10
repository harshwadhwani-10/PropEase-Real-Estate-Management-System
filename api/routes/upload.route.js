import express from "express";
import { uploadFile, uploadFiles } from "../controllers/upload.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { uploadSingle, uploadMultiple } from "../utils/upload.js";

const router = express.Router();

// Single file upload (protected)
router.post("/single", verifyToken, uploadSingle, uploadFile);

// Multiple files upload (protected)
router.post("/multiple", verifyToken, uploadMultiple, uploadFiles);

export default router;

