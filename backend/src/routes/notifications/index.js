import express from "express";
import { deleteNotification, getNotifications, readNotification } from "../../controllers/notifications/index.js";

const router = express.Router();

router.get("/", getNotifications);
router.patch("/", readNotification);
router.delete("/", deleteNotification);

export default router;
