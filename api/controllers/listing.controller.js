import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

//Create Listing
export const createListing = async (req, res, next) => {
  try {
    const listingData = {
      ...req.body,
      status: "pending", // Set status to pending on creation
    };
    const listing = await Listing.create(listingData);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

//Delete Listing
export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, "Listing not found!"));
  }

  // Allow owner or admin to delete
  if (req.user.id !== listing.userRef && req.user.role !== "admin") {
    return next(errorHandler(401, "You can only delete your own listings!"));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Listing has been deleted!");
  } catch (error) {
    next(error);
  }
};

//Update Listing
export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, "Listing not found!"));
  }
  // Allow owner or admin to update
  if (req.user.id !== listing.userRef && req.user.role !== "admin") {
    return next(errorHandler(401, "You can only update your own listings!"));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};
//Get Listing
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }
    // Only show approved listings to non-owners/non-admins
    if (listing.status !== "approved" && req.user?.id !== listing.userRef && req.user?.role !== "admin") {
      return next(errorHandler(403, "This listing is pending approval"));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};
//Search Functionality
export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    }

    const searchTerm = req.query.searchTerm || "";

    const sort = req.query.sort || "createdAt";

    const order = req.query.order || "desc";

    // Build query - only show approved listings to non-admins
    const query = {
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    };

    // If user is not admin, only show approved listings
    // Admins can see all listings (including pending/rejected) if showAll=true
    if (!req.user || req.user.role !== "admin" || req.query.showAll !== "true") {
      query.status = "approved";
    }

    const listings = await Listing.find(query)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
