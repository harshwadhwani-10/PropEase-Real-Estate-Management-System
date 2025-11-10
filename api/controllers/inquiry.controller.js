import Inquiry from "../models/inquiry.model.js";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { sendInquiryEmail } from "../utils/email.js";

// Create Inquiry
export const createInquiry = async (req, res, next) => {
  try {
    const { listingId, message, phone } = req.body;
    const userId = req.user.id;

    if (!listingId || !message) {
      return next(errorHandler(400, "Listing ID and message are required"));
    }

    // Get listing to find owner
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    // Prevent owners from inquiring about their own listings
    if (listing.userRef === userId) {
      return next(errorHandler(400, "You cannot inquire about your own listing"));
    }

    // Get user and owner details
    const user = await User.findById(userId);
    const owner = await User.findById(listing.userRef);

    if (!user || !owner) {
      return next(errorHandler(404, "User or owner not found"));
    }

    // Create inquiry
    const inquiry = new Inquiry({
      listingId,
      userId,
      ownerId: listing.userRef,
      message,
      phone: phone || "",
    });

    await inquiry.save();

    // Send email notification to owner
    try {
      await sendInquiryEmail({
        to: owner.email,
        ownerName: owner.username,
        inquirerName: user.username,
        inquirerEmail: user.email,
        listingName: listing.name,
        message,
        phone: phone || "Not provided",
      });
    } catch (emailError) {
      console.error("Error sending inquiry email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Inquiry sent successfully",
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// Get Inquiries for Owner
export const getOwnerInquiries = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const inquiries = await Inquiry.find({ ownerId })
      .populate("listingId", "name imageUrls address")
      .populate("userId", "username email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};

// Get User Inquiries
export const getUserInquiries = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const inquiries = await Inquiry.find({ userId })
      .populate("listingId", "name imageUrls address")
      .populate("ownerId", "username email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};

// Update Inquiry Status
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "read", "replied"].includes(status)) {
      return next(errorHandler(400, "Invalid status"));
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return next(errorHandler(404, "Inquiry not found"));
    }

    // Only owner can update status
    if (inquiry.ownerId.toString() !== req.user.id) {
      return next(errorHandler(403, "You can only update your own inquiries"));
    }

    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: "Inquiry status updated",
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

