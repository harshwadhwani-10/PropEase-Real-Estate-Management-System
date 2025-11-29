import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
import { geocodeAddress } from "../utils/geocode.js";
import { destroy, isCloudinaryConfigured } from "../utils/cloudinary.js";

//Create Listing
export const createListing = async (req, res, next) => {
  try {
    // Only owners and admins can create listings
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return next(
        errorHandler(403, "Only property owners can create listings!")
      );
    }

    // Geocode address if provided
    let location = { type: "Point", coordinates: [0, 0] };
    if (req.body.address) {
      const geocodeResult = await geocodeAddress(req.body.address);
      if (geocodeResult) {
        location = {
          type: "Point",
          coordinates: [geocodeResult.longitude, geocodeResult.latitude], // [lng, lat] for MongoDB
        };
      }
    }

    const listingData = {
      ...req.body,
      status: "pending", // Set status to pending on creation
      location: location,
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
    // Delete Cloudinary images if configured and listing has imageUrls
    if (
      isCloudinaryConfigured() &&
      listing.imageUrls &&
      listing.imageUrls.length > 0
    ) {
      // Extract public_ids from imageUrls (assuming format: https://res.cloudinary.com/.../image/upload/v1234567890/folder/public_id.jpg)
      // Or store public_ids separately - for now, try to extract from URL
      const deletePromises = listing.imageUrls.map(async (url) => {
        try {
          // Extract public_id from Cloudinary URL
          // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{ext}
          const urlParts = url.split("/");
          const uploadIndex = urlParts.findIndex((part) => part === "upload");
          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            // Get everything after "upload" and before the file extension
            const pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");
            const publicId = pathAfterUpload.split(".")[0]; // Remove extension
            if (publicId) {
              await destroy(publicId);
            }
          }
        } catch (err) {
          console.error("Error deleting Cloudinary image:", err);
          // Continue even if one deletion fails
        }
      });
      await Promise.all(deletePromises);
    }

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
    // Geocode address if it was updated
    let updateData = { ...req.body };
    if (req.body.address && req.body.address !== listing.address) {
      const geocodeResult = await geocodeAddress(req.body.address);
      if (geocodeResult) {
        updateData.location = {
          type: "Point",
          coordinates: [geocodeResult.longitude, geocodeResult.latitude],
        };
      }
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    const listing = await Listing.findById(req.params.id).populate(
      "userRef",
      "username email avatar"
    );
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }
    // Allow viewing all listings (including pending) - users can see property details
    // But only approved listings will show in search results
    // Owners and admins can always see their own listings
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

    // Basic filters
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

    // Price range filters
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice
      ? parseInt(req.query.maxPrice)
      : Number.MAX_SAFE_INTEGER;

    // Build query - only show approved listings to non-admins
    const query = {
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    };

    // Price filter - check effective price (discountPrice if offer, else regularPrice)
    if (minPrice > 0 || maxPrice < Number.MAX_SAFE_INTEGER) {
      query.$or = [
        // Listings with offers: check discountPrice
        {
          $and: [
            { offer: true },
            { discountPrice: { $gte: minPrice, $lte: maxPrice } },
          ],
        },
        // Listings without offers: check regularPrice
        {
          $and: [
            { offer: { $ne: true } },
            { regularPrice: { $gte: minPrice, $lte: maxPrice } },
          ],
        },
        // Fallback: if discountPrice doesn't exist, check regularPrice
        {
          $and: [
            { offer: true },
            { discountPrice: { $exists: false } },
            { regularPrice: { $gte: minPrice, $lte: maxPrice } },
          ],
        },
      ];
    }

    // If user is not admin, only show approved listings
    // Admins and owners can see all listings (including pending/rejected) if showAll=true
    // Owners can only see their own listings with all statuses
    if (req.query.showAll === "true") {
      // Allow admins to see all listings
      // Allow owners to see their own listings with all statuses
      if (req.user && req.user.role === "owner") {
        // For owners, only show their own listings
        query.userRef = req.user.id;
      }
      // For admins, show all listings (no additional filter needed)
    } else {
      // Default: only show approved listings
      query.status = "approved";
    }

    // Geospatial search (radius-based)
    let listings;
    if (req.query.lat && req.query.lng && req.query.radiusKm) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radiusKm = parseFloat(req.query.radiusKm);
      const radiusMeters = radiusKm * 1000;

      // Add geospatial query
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat], // [longitude, latitude]
          },
          $maxDistance: radiusMeters,
        },
      };

      listings = await Listing.find(query)
        .sort({ [sort]: order })
        .limit(limit)
        .skip(startIndex);
    } else {
      listings = await Listing.find(query)
        .sort({ [sort]: order })
        .limit(limit)
        .skip(startIndex);
    }

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
