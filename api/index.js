import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import adminRouter from "./routes/admin.route.js";
import uploadRouter from "./routes/upload.route.js";
import inquiryRouter from "./routes/inquiry.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import xssClean from "xss-clean";
import { logger } from "./utils/logger.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

const __dirname = path.resolve();
const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(xssClean());

// --------------------------------------------------------
// ✅ ALLOW ALL ORIGINS (DYNAMIC) + ALLOW CREDENTIALS
// --------------------------------------------------------
app.use(
  cors({
    origin: true, // reflect request origin dynamically (allows all)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// For preflight requests
app.options("*", cors({ origin: true, credentials: true }));

app.use(logger);

// Health endpoints
app.get("/health", (req, res) => {
  return res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get("/api/health", (req, res) => {
  return res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// API routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/inquiry", inquiryRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running on Port ${process.env.PORT}!`);
});
