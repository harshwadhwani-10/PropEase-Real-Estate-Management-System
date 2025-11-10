// api/utils/logger.js
import morgan from "morgan";
import fs from "fs";
import path from "path";

/**
 * Custom request logging setup using Morgan
 * Logs clean, timestamped requests to both console & file
 */

const __dirname = path.resolve();

// 📁 Ensure logs directory exists
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// 🧾 Create write stream for file logs (append mode)
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

// 🎨 Define custom Morgan format
const customFormat = (tokens, req, res) => {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  return [
    `[${timestamp}]`,
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    `${tokens["response-time"](req, res)} ms`,
    "-",
    tokens.res(req, res, "content-length") || "0",
    "bytes",
    "| IP:",
    req.ip,
  ].join(" ");
};

// 🧩 Create morgan middlewares
export const logger = {
  // Logs to console (readable)
  console: morgan(customFormat, {
    skip: (req, res) => process.env.NODE_ENV === "production", // Skip console logs in prod
  }),

  // Logs to file (persistent)
  file: morgan(customFormat, {
    stream: accessLogStream,
  }),
};
