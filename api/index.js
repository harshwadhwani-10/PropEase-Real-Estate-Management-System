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
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
app.use(helmet());
app.use(xssClean());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use(limiter);

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://propease-frontend-alb-745773215.ap-south-1.elb.amazonaws.com",
//     ],
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

app.use(logger);

// Health endpoints for monitoring / load balancers
app.get("/health", (req, res) => {
  return res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Also expose under /api/health so the client can probe via the proxied path
app.get("/api/health", (req, res) => {
  return res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

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
