import express from "express";
import {
  createComment,
  getTaskComments
} from "../controllers/commentController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| COMMENT ROUTES – SPRINT 2
|--------------------------------------------------------------------------
| All routes are protected by JWT.
|--------------------------------------------------------------------------
*/

// 🔐 Protect all comment routes
router.use(protect);

// ✅ Create a comment on a task
router.post("/tasks/:taskId/comments", createComment);

// ✅ Get all comments for a task
router.get("/tasks/:taskId/comments", getTaskComments);

// ✅ Export router (IMPORTANT)
export default router;