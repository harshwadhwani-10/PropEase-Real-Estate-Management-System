import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import Listing from "../models/listing.model.js";
import { destroy, extractPublicIdFromUrl, isCloudinaryConfigured } from "../utils/cloudinary.js";

//Update User
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    // Get current user to check for old avatar
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return next(errorHandler(404, "User not found!"));
    }

    // Build update object with only provided fields
    const updateData = {};
    
    if (req.body.username) {
      updateData.username = req.body.username;
    }
    
    if (req.body.email) {
      updateData.email = req.body.email;
    }
    
    if (req.body.password) {
      updateData.password = bcryptjs.hashSync(req.body.password, 10);
    }
    
    // Handle avatar update - delete old avatar from Cloudinary if new one is provided
    if (req.body.avatar) {
      const newAvatarUrl = req.body.avatar;
      const oldAvatarUrl = currentUser.avatar;

      // If avatar is changing and Cloudinary is configured, delete old avatar
      if (
        newAvatarUrl !== oldAvatarUrl &&
        isCloudinaryConfigured() &&
        oldAvatarUrl &&
        oldAvatarUrl.includes("cloudinary.com")
      ) {
        try {
          // Extract public_id from old avatar URL
          const oldPublicId = extractPublicIdFromUrl(oldAvatarUrl);
          if (oldPublicId) {
            // Don't delete default avatar
            const defaultAvatarUrl = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
            if (oldAvatarUrl !== defaultAvatarUrl) {
              await destroy(oldPublicId);
              console.log(`✅ Deleted old avatar from Cloudinary: ${oldPublicId}`);
            }
          }
        } catch (deleteError) {
          console.error("Error deleting old avatar from Cloudinary:", deleteError);
          // Don't fail the update if deletion fails, just log it
        }
      }

      updateData.avatar = newAvatarUrl;
    }

    // If no fields to update, return current user
    if (Object.keys(updateData).length === 0) {
      const { password, ...rest } = currentUser._doc;
      return res.status(200).json(rest);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found!"));
    }

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
//Delete User
export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your own account!"));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User has been deleted!");
  } catch (error) {
    next(error);
  }
};
//Get User Listing
export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own listings!"));
  }
};
// Get User
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return next(errorHandler(404, "User not found!"));

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Get All Users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Check if email exists (for OAuth)
export const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }
    
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (error) {
    next(error);
  }
};