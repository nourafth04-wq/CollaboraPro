import express from "express";
import {
  createSubTask,
  getSubTasks,
  updateSubTask,
  deleteSubTask
} from "../controllers/subTaskController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔐 All routes secured
router.use(protect);

// ✅ Subtasks inside a task
router.post("/tasks/:taskId/subtasks", createSubTask);
router.get("/tasks/:taskId/subtasks", getSubTasks);

// ✅ Single subtask operations
router.put("/subtasks/:id", updateSubTask);
router.delete("/subtasks/:id", deleteSubTask);

export default router;