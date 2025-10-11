// backend/src/cors.js
import cors from "cors";

/**
 * Configure CORS for Express app
 * @param {import('express').Express} app
 */
const allowedOrigins = [
  "http://localhost:9000",
  "http://localhost:8100",
  "http://localhost:4200",
  "http://localhost:5173", // vite dev server (frontend)
];

export default function setCors(app) {
  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin (like curl, mobile apps, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error("CORS policy: Origin not allowed"), false);
      },
      credentials: true,
      exposedHeaders: ["Authorization"],
    })
  );
}
