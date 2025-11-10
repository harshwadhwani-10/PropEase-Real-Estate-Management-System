import express from "express";
import {
  createInquiry,
  getOwnerInquiries,
  getUserInquiries,
  updateInquiryStatus,
} from "../controllers/inquiry.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createInquiry);
router.get("/owner", verifyToken, getOwnerInquiries);
router.get("/user", verifyToken, getUserInquiries);
router.patch("/:id/status", verifyToken, updateInquiryStatus);

export default router;

