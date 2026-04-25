import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Document from "../models/Document.js";

// Helper — always compare as strings to avoid ObjectId vs string mismatch
const isMember = (project, userId) =>
  project.members.some(m => m.user._id.toString() === userId.toString());

export const getProjectStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("members.user", "email");
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isMember(project, req.user.id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied." });

    const tasks = await Task.find({ project: req.params.projectId });
    const now   = new Date();
    const done  = tasks.filter(t => t.status === "done").length;
    const docs  = await Document.countDocuments({ project: req.params.projectId });

    res.json({
      project: { name: project.name, status: project.status, deadline: project.deadline },
      tasks: {
        total: tasks.length,
        todo:  tasks.filter(t => t.status === "todo").length,
        doing: tasks.filter(t => t.status === "doing").length,
        done,
        overdue: tasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== "done").length,
        completionRate: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0,
      },
      priorities: {
        high:   tasks.filter(t => t.priority === "high").length,
        medium: tasks.filter(t => t.priority === "medium").length,
        low:    tasks.filter(t => t.priority === "low").length,
      },
      members:   project.members.length,
      documents: docs,
    });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const getMemberStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("members.user", "email role");
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isMember(project, req.user.id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied." });

    const tasks = await Task.find({ project: req.params.projectId });
    const memberStats = project.members.map(m => {
      const id        = m.user._id.toString();
      const assigned  = tasks.filter(t => t.assignee?.toString() === id);
      const completed = assigned.filter(t => t.status === "done").length;
      return {
        user:        { _id: m.user._id, email: m.user.email, role: m.user.role },
        projectRole: m.role,
        tasks: {
          total:          assigned.length,
          completed,
          inProgress:     assigned.filter(t => t.status === "doing").length,
          pending:        assigned.filter(t => t.status === "todo").length,
          completionRate: assigned.length > 0 ? Math.round((completed / assigned.length) * 100) : 0,
        },
      };
    });
    res.json({ memberStats });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const exportReport = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("owner", "email")
      .populate("members.user", "email role");
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isMember(project, req.user.id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied." });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignee", "email")
      .populate("createdBy", "email");
    const docs = await Document.find({ project: req.params.projectId }).populate("uploadedBy", "email");

    res.json({
      generatedAt: new Date().toISOString(),
      project: { name: project.name, description: project.description, status: project.status, deadline: project.deadline, owner: project.owner.email },
      members:  project.members.map(m => ({ email: m.user.email, role: m.role })),
      tasks: {
        total: tasks.length,
        todo:  tasks.filter(t => t.status === "todo").length,
        doing: tasks.filter(t => t.status === "doing").length,
        done:  tasks.filter(t => t.status === "done").length,
        list:  tasks.map(t => ({
          title:         t.title,
          status:        t.status,
          priority:      t.priority,
          assignee:      t.assignee?.email || "Unassigned",
          deadline:      t.deadline,
          subTasksDone:  t.subTasks.filter(s => s.completed).length,
          subTasksTotal: t.subTasks.length,
          commentsCount: t.comments.length,
        })),
      },
      documents: docs.map(d => ({ name: d.name, uploadedBy: d.uploadedBy.email, currentVersion: d.currentVersion, uploadedAt: d.createdAt })),
    });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};
