import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { sendListingApprovalEmail } from "../utils/email.js";

// Get all pending listings
export const getPendingListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: "pending" })
      .populate("userRef", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

// Approve a listing
export const approveListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    if (listing.status === "approved") {
      return next(errorHandler(400, "Listing is already approved"));
    }

    listing.status = "approved";
    listing.approvedBy = req.user.id;
    listing.approvedAt = new Date();
    await listing.save();

    // Send email notification to owner
    try {
      const owner = await User.findById(listing.userRef);
      if (owner) {
        await sendListingApprovalEmail({
          to: owner.email,
          ownerName: owner.username,
          listingName: listing.name,
          status: "approved",
        });
      }
    } catch (emailError) {
      console.error("Error sending approval email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      message: "Listing approved successfully",
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// Reject a listing
export const rejectListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    if (listing.status === "rejected") {
      return next(errorHandler(400, "Listing is already rejected"));
    }

    listing.status = "rejected";
    listing.approvedBy = req.user.id;
    listing.approvedAt = new Date();
    await listing.save();

    // Send email notification to owner
    try {
      const owner = await User.findById(listing.userRef);
      if (owner) {
        await sendListingApprovalEmail({
          to: owner.email,
          ownerName: owner.username,
          listingName: listing.name,
          status: "rejected",
        });
      }
    } catch (emailError) {
      console.error("Error sending rejection email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      message: "Listing rejected successfully",
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// Get all listings with owner names
export const getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find()
      .populate("userRef", "username email avatar")
      .sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

// Get all inquiries (for admin notifications)
export const getAllInquiries = async (req, res, next) => {
  try {
    const Inquiry = (await import("../models/inquiry.model.js")).default;
    const inquiries = await Inquiry.find()
      .populate("listingId", "name imageUrls address")
      .populate("userId", "username email avatar")
      .populate("ownerId", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    next(error);
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // Validate role
    if (!["buyer", "owner", "admin"].includes(role)) {
      return next(errorHandler(400, "Invalid role. Must be 'buyer', 'owner', or 'admin'"));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(404, "User not found!"));
    }

    // Prevent admin from removing their own admin role
    if (user._id.toString() === req.user.id && role !== "admin") {
      return next(errorHandler(400, "You cannot remove your own admin role"));
    }

    user.role = role;
    await user.save();

    const { password: pass, ...rest } = user._doc;
    res.status(200).json({
      message: "User role updated successfully",
      user: rest,
    });
  } catch (error) {
    next(error);
  }
};

