import express from "express";
import {
  getPendingListings,
  approveListing,
  rejectListing,
  updateUserRole,
  getAllListings,
  getAllInquiries,
} from "../controllers/admin.controller.js";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.get("/listings/pending", verifyToken, verifyAdmin, getPendingListings);
router.get("/listings/all", verifyToken, verifyAdmin, getAllListings);
router.post("/listings/:id/approve", verifyToken, verifyAdmin, approveListing);
router.post("/listings/:id/reject", verifyToken, verifyAdmin, rejectListing);
router.get("/inquiries", verifyToken, verifyAdmin, getAllInquiries);
router.patch("/users/:id/role", verifyToken, verifyAdmin, updateUserRole);

export default router;

