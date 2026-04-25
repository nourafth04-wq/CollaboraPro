import { Router } from "express";
import { createTask, getTasks, getTaskById, updateTask, deleteTask, addComment, deleteComment, addSubTask, toggleSubTask, deleteSubTask } from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router({ mergeParams: true });
router.use(protect);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:taskId", getTaskById);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);
router.post("/:taskId/comments", addComment);
router.delete("/:taskId/comments/:commentId", deleteComment);
router.post("/:taskId/subtasks", addSubTask);
router.patch("/:taskId/subtasks/:subTaskId/toggle", toggleSubTask);
router.delete("/:taskId/subtasks/:subTaskId", deleteSubTask);

export default router;
