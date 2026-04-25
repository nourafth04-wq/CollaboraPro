import { Router } from "express";
import { getProjectStats, getMemberStats, exportReport } from "../controllers/statsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router({ mergeParams: true });
router.use(protect);

router.get("/", getProjectStats);
router.get("/members", getMemberStats);
router.get("/export", exportReport);

export default router;
