import express from "express";
import { forgotPassword, resetPassword } from "../controllers/passwordController.js";

const router = express.Router();

// ✅ request reset
router.post("/forgot-password", forgotPassword);

// ✅ perform reset
router.post("/reset-password/:token", resetPassword);

export default router;