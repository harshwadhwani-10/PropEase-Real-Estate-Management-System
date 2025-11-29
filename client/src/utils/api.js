import axios from "axios";

// Normalize base URL from Vite env. Keep it as empty string for relative paths.
const rawBase = import.meta.env.VITE_API_URL || "";
const normalizedBase = rawBase === "/" ? "" : rawBase.replace(/\/+$/, "");

const api = axios.create({
  baseURL: normalizedBase || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Prevent duplicate `/api` when both baseURL and request paths include it.
api.interceptors.request.use((config) => {
  try {
    const b = config.baseURL || "";
    const u = config.url || "";
    if (b.endsWith("/api") && u.startsWith("/api")) {
      // remove leading /api from request url so final request becomes /api/...
      config.url = u.replace(/^\/api/, "");
    }
  } catch (e) {
    // ignore and continue
  }
  return config;
});

export default api;
