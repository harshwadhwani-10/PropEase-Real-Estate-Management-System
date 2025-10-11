import express from "express";
import usersRoutes from "./users/index.js";
import authRoutes from "./auth/index.js";
import propertiesRoutes from "./properties/index.js";
import enquiriesRoutes from "./enquiries/index.js";
import activitiesRoutes from "./activity/index.js";
import notificationsRoutes from "./notifications/index.js";

const router = express.Router();

// Base route
router.get("/", (req, res) => {
  console.log("GET Request at base '/'");
  res.send(true);
});

// Register sub-routes
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/properties", propertiesRoutes);
router.use("/enquiries", enquiriesRoutes);
router.use("/activities", activitiesRoutes);
router.use("/notifications", notificationsRoutes);

export default router;
