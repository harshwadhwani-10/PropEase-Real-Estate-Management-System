// backend/src/websocket/index.js
import { Server as SocketIOServer } from "socket.io";
import { userIdToken } from "../utils/users.js";

/**
 * Initialize websocket (Socket.IO) on given HTTP server and return `io`.
 * Also exposes helper functions sendTargetedNotification & sendGeneralNotification.
 * @param {http.Server} httpServer
 * @returns {import("socket.io").Server}
 */
export function initWebsocket(httpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (process.env.CLIENT_URL || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean).length
        ? (process.env.CLIENT_URL || "").split(",").map((s) => s.trim())
        : ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Map from userId -> Set of socket IDs
  io.userSocketMap = new Map();

  io.on("connection", (socket) => {
    // Read token from handshake auth
    const { token } = socket.handshake.auth || {};
    if (token) {
      try {
        const uid = userIdToken(token.toString());
        socket.userId = uid;

        // Track mapping (many sockets per user possible)
        const existing = io.userSocketMap.get(uid) || new Set();
        existing.add(socket.id);
        io.userSocketMap.set(uid, existing);
      } catch (e) {
        console.warn("Invalid userToken on websocket connect:", e.message || e);
      }
    }

    console.log("WebSocket connected:", socket.id, "userId:", socket.userId || "anonymous");

    socket.on("joinRoom", (room) => {
      socket.join(room);
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
    });

    socket.on("message", (msg) => {
      let parsed;
      try {
        parsed = typeof msg === "string" ? JSON.parse(msg) : msg;
      } catch {
        parsed = msg;
      }
      console.log("WS message:", parsed);
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        const set = io.userSocketMap.get(socket.userId);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) io.userSocketMap.delete(socket.userId);
        }
      }
      console.log("WebSocket disconnected:", socket.id);
    });
  });

  return io;
}

/**
 * Send notification to specific user(s) by userId.
 * @param {import("socket.io").Server} io
 * @param {String} type
 * @param {Object} payload
 * @param {String|String[]} targetUserId
 */
export function sendTargetedNotification(io, type, payload, targetUserId) {
  if (!io) return;
  const targets = Array.isArray(targetUserId) ? targetUserId : [targetUserId];
  for (const uid of targets) {
    const sockets = io.userSocketMap.get(uid);
    if (sockets) {
      for (const sid of sockets) {
        const sock = io.sockets.sockets.get(sid);
        if (sock && sock.connected) {
          sock.emit("notification", { type, payload });
        }
      }
    }
  }
}

/**
 * Broadcast to all connected clients
 * @param {import("socket.io").Server} io
 * @param {String} type
 * @param {Object} payload
 */
export function sendGeneralNotification(io, type, payload) {
  if (!io) return;
  io.emit("notification", { type, payload });
}

// Default export: caller can import and call initWebsocket(httpServer)
