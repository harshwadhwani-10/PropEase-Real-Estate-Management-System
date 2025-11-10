import express from "express";
import {
  deleteUser,
  updateUser,
  getUserListings,
  getUser,
  getAllUsers,
  checkEmail,
} from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/check-email", checkEmail); // Check if email exists (public, for OAuth)
router.post("/update/:id", verifyToken, updateUser); //Update User
router.delete("/delete/:id", verifyToken, deleteUser); //Delete User
router.get("/listings/:id", verifyToken, getUserListings); //User Listing
router.get("/all", verifyToken, verifyAdmin, getAllUsers); //Get All Users (Admin)
router.get("/:id", verifyToken, getUser); //Get User

export default router;
