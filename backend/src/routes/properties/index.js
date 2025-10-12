import express from "express";
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

router.get("/", getProperties);
router.get("/me", getMyProperties);
router.get("/:id", getProperty);
router.post("/", verifyToken, createProperty);
router.patch("/:id", updateProperty);
router.delete("/:id", deleteProperty);
router.post("/upload/images/:id", addImagesProperty);
router.delete("/upload/images/:id", deleteImagesProperty);

export default router;
