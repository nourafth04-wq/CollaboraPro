import Notification from "../models/Notification.js";

export const createNotification = async ({ recipient, type, message, link = "", relatedProject = null, relatedTask = null }) => {
  try {
    await Notification.create({ recipient, type, message, link, relatedProject, relatedTask });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};
