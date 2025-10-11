import express from "express";
import { getActivities } from "../../controllers/activities/index.js";

const router = express.Router();

// GET /activities
router.get("/", getActivities);

export default router;
