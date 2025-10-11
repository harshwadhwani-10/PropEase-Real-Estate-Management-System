// backend/src/utils/users.js
import jwt from "jsonwebtoken";

/**
 * Get user id from JWT token (verifies signature).
 * Uses process.env.JWT_SECRET — set JWT_SECRET in your .env.
 * @param {string} token
 * @returns {string|null}
 */
export const userIdToken = function (token) {
  if (!token || typeof token !== "string") return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret);
    return decoded?.id ?? null;
  } catch (err) {
    // invalid token
    return null;
  }
};

/**
 * Checks if a new password is valid.
 * @param {string} password
 * @returns {boolean}
 */
export const isPasswordValid = function (password) {
  if (typeof password !== "string") return false;
  return (
    password.length >= 8 &&
    /\d/.test(password) &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

/**
 * Extracts bearer token safely from Express request.
 * @param {import("express").Request} request
 * @returns {string|null}
 */
export const authBearerToken = function (request) {
  const authorization = request?.headers?.authorization || "";
  if (!authorization) return null;
  const parts = authorization.split(" ");
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
};
