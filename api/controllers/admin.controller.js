import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

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

    res.status(200).json({
      message: "Listing rejected successfully",
      listing,
    });
  } catch (error) {
    next(error);
  }
};

