import User from "../models/user.model.js";
import PasswordReset from "../models/passwordReset.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { validationResult, body } from "express-validator";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/email.js";

// Validation rules for signup
export const validateSignup = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

//Sign-Up
export const signup = async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errorHandler(400, errors.array()[0].msg));
  }

  const { username, email, password, role } = req.body;
  
  // Validate role
  const validRoles = ["buyer", "owner"];
  const userRole = validRoles.includes(role) ? role : "buyer";
  
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ 
    username, 
    email, 
    password: hashedPassword,
    role: userRole
  });
  try {
    await newUser.save();
    res.status(201).json("User Created Successfully!");
  } catch (error) {
    next(error);
  }
};

//Sign-In
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User Not Found!"));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials!"));
    const token = jwt.sign({ id: validUser._id, role: validUser.role }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie("access_token", token, { 
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

//Google Sign-In
export const google = async (req, res, next) => {
  try {
    const { email, name, photo, role } = req.body;
    
    if (!email || !name) {
      return next(errorHandler(400, "Email and name are required"));
    }

    const user = await User.findOne({ email });
    if (user) {
      // User exists, sign in
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token", token, { 
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
        .status(200)
        .json(rest);
    } else {
      // New user, create account
      // Validate role if provided
      const validRoles = ["buyer", "owner"];
      const userRole = role && validRoles.includes(role) ? role : "buyer";
      
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      
      // Generate unique username
      let username = name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4);
      let usernameExists = await User.findOne({ username });
      let counter = 0;
      while (usernameExists && counter < 10) {
        username = name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4);
        usernameExists = await User.findOne({ username });
        counter++;
      }
      
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        avatar: photo || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        role: userRole,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie("access_token", token, { 
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
//Sign-Out
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    res.status(200).json("User has been logged out!");
  } catch (error) {
    next(error);
  }
};

// Forgot Password - Send reset email
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Create new password reset token (expires in 5 minutes)
    const passwordReset = new PasswordReset({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await passwordReset.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail({
        to: user.email,
        username: user.username,
        resetUrl,
      });
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      // Delete the token if email fails
      await PasswordReset.deleteOne({ _id: passwordReset._id });
      return next(errorHandler(500, "Failed to send reset email. Please try again later."));
    }

    res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password - Verify token and reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return next(errorHandler(400, "Token, password, and confirm password are required"));
    }

    if (password !== confirmPassword) {
      return next(errorHandler(400, "Passwords do not match"));
    }

    if (password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters long"));
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the reset token
    const passwordReset = await PasswordReset.findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }, // Token not expired
    });

    if (!passwordReset) {
      return next(errorHandler(400, "Invalid or expired reset token. Please request a new one."));
    }

    // Find the user
    const user = await User.findById(passwordReset.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Hash new password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark token as used
    passwordReset.used = true;
    await passwordReset.save();

    // Delete all reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// Verify Reset Token
export const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return next(errorHandler(400, "Token is required"));
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the reset token
    const passwordReset = await PasswordReset.findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }, // Token not expired
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    next(error);
  }
};
