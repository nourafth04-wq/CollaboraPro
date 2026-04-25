import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { createNotification } from "../utils/notifyAction.js";

const isMemberOf = (p, uid) => p.members.some(m => m.user.toString() === uid.toString() || m.user._id?.toString() === uid.toString());

export const createTask = async (req, res) => {
  try {
    const { title, description, assignee, priority, deadline } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isMemberOf(project, req.user.id)) return res.status(403).json({ message: "Access denied." });
    const task = await Task.create({
      title, description, assignee: assignee || null,
      priority: priority || "medium", deadline: deadline || null,
      project: project._id, createdBy: req.user.id,
    });
    if (assignee && assignee !== req.user.id)
      await createNotification({ recipient: assignee, type: "task_assigned", message: `You were assigned to task "${title}" in project "${project.name}".`, link: `/projects/${project._id}`, relatedProject: project._id, relatedTask: task._id });
    res.status(201).json({ message: "Task created.", task });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const getTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isMemberOf(project, req.user.id)) return res.status(403).json({ message: "Access denied." });
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignee", "email role")
      .populate("createdBy", "email")
      .populate("comments.author", "email")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("assignee", "email role")
      .populate("createdBy", "email")
      .populate("comments.author", "email");
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });
    const project = await Project.findById(task.project);
    if (!isMemberOf(project, req.user.id)) return res.status(403).json({ message: "Access denied." });
    const { title, description, status, priority, deadline, assignee } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (deadline !== undefined) task.deadline = deadline;
    if (status && status !== task.status) {
      task.status = status;
      if (task.assignee && task.assignee.toString() !== req.user.id)
        await createNotification({ recipient: task.assignee, type: "task_status_changed", message: `Task "${task.title}" status changed to "${status}".`, link: `/projects/${project._id}`, relatedProject: project._id, relatedTask: task._id });
    }
    if (assignee !== undefined) {
      const prev = task.assignee?.toString();
      task.assignee = assignee || null;
      if (assignee && assignee !== prev && assignee !== req.user.id)
        await createNotification({ recipient: assignee, type: "task_assigned", message: `You were assigned to task "${task.title}".`, link: `/projects/${project._id}`, relatedProject: project._id, relatedTask: task._id });
    }
    await task.save();
    res.json({ message: "Task updated.", task });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });
    await task.deleteOne();
    res.json({ message: "Task deleted." });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content required." });
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });
    task.comments.push({ author: req.user.id, content });
    await task.save();
    const re = /@([a-fA-F0-9]{24})/g; let m;
    while ((m = re.exec(content)) !== null)
      if (m[1] !== req.user.id)
        await createNotification({ recipient: m[1], type: "mention", message: `You were mentioned in a comment on "${task.title}".`, link: `/projects/${task.project}`, relatedTask: task._id, relatedProject: task.project });
    if (task.assignee && task.assignee.toString() !== req.user.id)
      await createNotification({ recipient: task.assignee, type: "task_comment", message: `New comment on task "${task.title}".`, link: `/projects/${task.project}`, relatedTask: task._id, relatedProject: task.project });
    await task.populate("comments.author", "email");
    res.json({ message: "Comment added.", comments: task.comments });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });
    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found." });
    if (comment.author.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized." });
    comment.deleteOne(); await task.save();
    res.json({ message: "Comment deleted." });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const addSubTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title required." });
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });
    task.subTasks.push({ title }); await task.save();
    res.json({ message: "Sub-task added.", subTasks: task.subTasks });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const toggleSubTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });
    const sub = task.subTasks.id(req.params.subTaskId);
    if (!sub) return res.status(404).json({ message: "Sub-task not found." });
    sub.completed = !sub.completed; await task.save();
    res.json({ message: "Toggled.", subTasks: task.subTasks });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const deleteSubTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });
    task.subTasks = task.subTasks.filter(s => s._id.toString() !== req.params.subTaskId);
    await task.save();
    res.json({ message: "Sub-task deleted.", subTasks: task.subTasks });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};
