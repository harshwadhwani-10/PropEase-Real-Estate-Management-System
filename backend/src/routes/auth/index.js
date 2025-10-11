import express from "express";
import { register, signIn, googleAuth, changePassword } from "../../controllers/auth/index.js";

const router = express.Router();

router.post("/register", register);
router.post("/signin", signIn);
router.post("/google", googleAuth);
router.post("/change-password", changePassword);

export default router;
