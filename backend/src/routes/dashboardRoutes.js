import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| DASHBOARD ROUTES
|--------------------------------------------------------------------------
| Accessible only to authenticated users.
|--------------------------------------------------------------------------
*/

// 🔐 JWT protection
router.use(protect);

// ✅ GET /api/dashboard
router.get("/", getDashboardStats);

export default router;