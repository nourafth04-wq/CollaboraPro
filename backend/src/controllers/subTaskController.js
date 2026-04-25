import SubTask from "../models/SubTask.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { logAction } from "../utils/logAction.js";

/**
 * ✅ Create subtask
 */
export const createSubTask = async (req, res) => {
  try {
    const { title } = req.body;
    const { taskId } = req.params;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔐 Check project membership
    const isAllowed =
      req.user.role === "admin" ||
      project.owner.toString() === req.user.id ||
      project.members.includes(req.user.id);

    if (!isAllowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const subtask = await SubTask.create({
      title,
      parentTask: taskId,
      createdBy: req.user.id
    });

    await logAction(
      req.user.email,
      "CREATE_SUBTASK",
      title
    );

    return res.status(201).json(subtask);
  } catch (error) {
    console.error("CREATE SUBTASK ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Get all subtasks of a task
 */
export const getSubTasks = async (req, res) => {
  try {
    const { taskId } = req.params;

    const subtasks = await SubTask.find({
      parentTask: taskId
    }).sort({ createdAt: 1 });

    return res.json(subtasks);
  } catch (error) {
    console.error("GET SUBTASKS ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Update subtask (status or title)
 */
export const updateSubTask = async (req, res) => {
  try {
    const subtask = await SubTask.findById(req.params.id);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    Object.assign(subtask, req.body);
    await subtask.save();

    await logAction(
      req.user.email,
      "UPDATE_SUBTASK",
      subtask.title
    );

    return res.json(subtask);
  } catch (error) {
    console.error("UPDATE SUBTASK ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Delete subtask
 */
export const deleteSubTask = async (req, res) => {
  try {
    const subtask = await SubTask.findByIdAndDelete(req.params.id);

    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    await logAction(
      req.user.email,
      "DELETE_SUBTASK",
      subtask.title
    );

    return res.json({ message: "Subtask deleted" });
  } catch (error) {
    console.error("DELETE SUBTASK ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};