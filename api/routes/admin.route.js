import express from "express";
import {
  getPendingListings,
  approveListing,
  rejectListing,
} from "../controllers/admin.controller.js";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.get("/listings/pending", verifyToken, verifyAdmin, getPendingListings);
router.post("/listings/:id/approve", verifyToken, verifyAdmin, approveListing);
router.post("/listings/:id/reject", verifyToken, verifyAdmin, rejectListing);

export default router;

