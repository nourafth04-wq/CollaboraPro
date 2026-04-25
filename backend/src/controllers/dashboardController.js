import Project  from "../models/Project.js";
import Task     from "../models/Task.js";
import AdminLog from "../models/AdminLog.js";

export const getDashboardStats = async (req, res) => {
  try {
    const uid = req.user.id.toString();

    let projectFilter = {};
    let taskFilter    = {};

    if (req.user.role !== "admin") {
      // Project.members = [{ user: ObjectId, role }] — must query members.user
      projectFilter = { "members.user": uid };
      // Task field is "assignee" not "assignedTo"
      taskFilter    = { assignee: uid };
    }

    const totalProjects = await Project.countDocuments(projectFilter);

    // Task statuses: "todo" | "doing" | "done"  — NOT "in_progress"
    const todoTasks  = await Task.countDocuments({ ...taskFilter, status: "todo"  });
    const doingTasks = await Task.countDocuments({ ...taskFilter, status: "doing" });
    const doneTasks  = await Task.countDocuments({ ...taskFilter, status: "done"  });

    let recentActivity = [];
    if (req.user.role === "admin") {
      recentActivity = await AdminLog.find().sort({ createdAt: -1 }).limit(10);
    }

    res.json({
      projects: totalProjects,
      tasks: {
        total:       todoTasks + doingTasks + doneTasks,
        todo:        todoTasks,
        in_progress: doingTasks,  // keep same key so frontend doesn't break
        done:        doneTasks,
      },
      recentActivity,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
