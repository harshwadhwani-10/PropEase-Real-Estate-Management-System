import express from "express";
import { getUsers, getUser, getMe, updateMe } from "../../controllers/users/index.js";

const router = express.Router();

router.get("/me", getMe);
router.patch("/me", updateMe);
router.get("/:id", getUser);
router.get("/", getUsers);

export default router;
