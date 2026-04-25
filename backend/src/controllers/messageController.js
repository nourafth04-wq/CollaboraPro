import Message from "../models/Message.js";
import Project from "../models/Project.js";
import { createNotification } from "../utils/notifyAction.js";

const isMemberOf = (p, uid) => p.members.some(m => m.user.toString() === uid);

export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Content required." });
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isMemberOf(project, req.user.id)) return res.status(403).json({ message: "Access denied." });
    const re = /@([a-fA-F0-9]{24})/g; const mentions = []; let m;
    while ((m = re.exec(content)) !== null) mentions.push(m[1]);
    const message = await Message.create({ project: project._id, sender: req.user.id, content, mentions });
    for (const id of mentions)
      if (id !== req.user.id)
        await createNotification({ recipient: id, type: "mention", message: `You were mentioned in a message in project "${project.name}".`, link: `/projects/${project._id}`, relatedProject: project._id });
    await message.populate("sender", "email role");
    res.status(201).json({ message: "Message sent.", data: message });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const getMessages = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isMemberOf(project, req.user.id)) return res.status(403).json({ message: "Access denied." });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await Message.find({ project: req.params.projectId })
      .populate("sender", "email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Message.countDocuments({ project: req.params.projectId });
    res.json({ messages: messages.reverse(), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { project: req.params.projectId, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );
    res.json({ message: "Messages marked as read." });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ message: "Message not found." });
    if (msg.sender.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized." });
    await msg.deleteOne();
    res.json({ message: "Message deleted." });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};
