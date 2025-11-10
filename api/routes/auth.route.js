import express from "express";
import {
  google,
  signOut,
  signin,
  signup,
  validateSignup,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", validateSignup, signup); //Sign-Up
router.post("/signin", signin); //Sign-In
router.post("/google", google); //Google
router.get("/signout", signOut); //Sign-Out
router.post("/forgot-password", forgotPassword); // Forgot Password
router.post("/reset-password", resetPassword); // Reset Password
router.get("/verify-reset-token/:token", verifyResetToken); // Verify Reset Token

export default router;
