import jwt from "jsonwebtoken";

/**
 * Simple JWT verification middleware.
 * It expects the token in the "Authorization" header as "Bearer <token>"
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied: No Token Provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: Invalid Token Format." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Failed:", err.message);
    return res.status(403).json({ message: "Invalid or Expired Token." });
  }
};
