// backend/src/static.js
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Serve /uploads as static files on /uploads prefix
 * @param {import('express').Express} app
 */
export const setStatic = async function (app) {
  const uploadsPath = path.join(__dirname, "..", "uploads");
  app.use("/uploads", (req, res, next) => {
    // optional: any access control can be added here
    next();
  });
  app.use("/uploads", (await import("express")).default.static(uploadsPath));
};
