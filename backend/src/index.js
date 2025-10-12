import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import corsMiddleware from "./cors.js";
import { setStatic } from "./static.js";
import { setSwagger } from "./swagger.js";
import routes from "./routes/index.js";

import {
  initWebsocket,
  sendGeneralNotification,
  sendTargetedNotification,
} from "./websocket/index.js";

const app = express();
const httpServer = http.createServer(app);

// 🧩 Middlewares
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
corsMiddleware(app);

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens["response-time"](req, res) + "ms",
    ].join(" ");
  })
);

// 📂 Serve static files (uploads)
setStatic(app);

// 📘 Swagger / API Docs
setSwagger(app);

// 🩺 Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Backend running!" });
});

// 📦 Main routes
app.use("/", routes);

// ⚡ Initialize WebSocket (Socket.IO)
const io = initWebsocket(httpServer);
app.locals.sendGeneralNotification = sendGeneralNotification;
app.locals.sendTargetedNotification = sendTargetedNotification;

// 🧱 Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

// 🌿 Connect MongoDB and start server
const MONGO_URI = process.env.DB_CONNECT || process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing DB_CONNECT / MONGO_URI env var");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`✅ PropEase backend running at http://localhost:${PORT}`);
      console.log(`📘 Docs available at http://localhost:${PORT}/docs`);
    });
  })
  .catch((e) => {
    console.error("❌ MongoDB connection error:", e);
    process.exit(1);
  });

export { app, httpServer, io };
