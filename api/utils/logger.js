// api/utils/logger.js
import morgan from "morgan";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

// Define custom Morgan format
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

let accessLogStream = null;

// Only create file logger in local development (not on read-only serverless platforms like Vercel)
if (!process.env.VERCEL) {
  try {
    const logDirectory = path.join(__dirname, "logs");
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }
    accessLogStream = fs.createWriteStream(
      path.join(logDirectory, "access.log"),
      { flags: "a" }
    );
  } catch (e) {
    // Ignore file logger creation errors in restricted environments
  }
}

/**
 * Unified logger — logs to console & conditionally to file in local dev
 */
export const logger = morgan(customFormat, {
  stream: {
    write: (message) => {
      // Always write to console/stdout
      process.stdout.write(message);
      // Append to file only if stream is available
      if (accessLogStream) {
        try {
          accessLogStream.write(message);
        } catch (e) {
          // ignore
        }
      }
    },
  },
});
