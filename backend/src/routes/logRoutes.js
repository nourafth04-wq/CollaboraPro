import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import AdminLog from "../models/AdminLog.js";

const router = express.Router();

// ✅ GET ALL ADMIN LOGS (NO POPULATE — YOUR MODEL DOES NOT SUPPORT IT)
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ date: -1 }); // ✅ sort by latest
    res.json(logs);
  } catch (error) {
    console.log("LOG FETCH ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;