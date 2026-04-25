import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { logAction } from "../utils/logAction.js";

/* =======================================================
   CREATE COMMENT (US‑14)
======================================================= */
export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔐 Security: project membership check
    const isAllowed =
      req.user.role === "admin" ||
      project.owner.toString() === req.user.id ||
      project.members.includes(req.user.id);

    if (!isAllowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comment = await Comment.create({
      content,
      task: taskId,
      author: req.user.id,
    });

    await logAction(
      req.user.email,
      "ADD_COMMENT",
      `Task ${task.title}`
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error("CREATE COMMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =======================================================
   GET TASK COMMENTS
======================================================= */
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔐 Same security rule for reading comments
    const isAllowed =
      req.user.role === "admin" ||
      project.owner.toString() === req.user.id ||
      project.members.includes(req.user.id) ||
      project.clients.includes(req.user.id);

    if (!isAllowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comments = await Comment.find({ task: taskId })
      .populate("author", "email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};