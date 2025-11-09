import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import adminRouter from "./routes/admin.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";

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

// Security Middleware
app.use(helmet());
app.use(xssClean());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use(limiter);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// 🧾 Logger Middleware
app.use(morgan("dev"));

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/admin", adminRouter);

app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Global Error Handler
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
