import Project from "../models/Project.js";
import { createNotification } from "../utils/notifyAction.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, deadline } = req.body;
    if (!name) return res.status(400).json({ message: "Project name is required." });
    const project = await Project.create({
      name, description, deadline: deadline || null,
      owner: req.user.id,
      members: [{ user: req.user.id, role: req.user.role }],
    });
    res.status(201).json({ message: "Project created.", project });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ "members.user": req.user.id })
      .populate("owner", "email role")
      .populate("members.user", "email role")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "email role")
      .populate("members.user", "email role");
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!project.members.some(m => m.user._id.toString() === req.user.id))
      return res.status(403).json({ message: "Access denied." });
    res.json(project);
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (project.owner.toString() !== req.user.id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized." });
    const { name, description, status, deadline } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (deadline !== undefined) project.deadline = deadline;
    await project.save();
    res.json({ message: "Project updated.", project });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (project.owner.toString() !== req.user.id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized." });
    await project.deleteOne();
    res.json({ message: "Project deleted." });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const inviteMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (project.owner.toString() !== req.user.id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized." });
    if (project.members.some(m => m.user.toString() === userId))
      return res.status(400).json({ message: "User is already a member." });
    project.members.push({ user: userId, role: role || "team" });
    await project.save();
    await createNotification({
      recipient: userId, type: "project_invite",
      message: `You were invited to project "${project.name}".`,
      link: `/projects/${project._id}`, relatedProject: project._id,
    });
    res.json({ message: "Member invited.", project });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (project.owner.toString() !== req.user.id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized." });
    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    res.json({ message: "Member removed.", project });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};
