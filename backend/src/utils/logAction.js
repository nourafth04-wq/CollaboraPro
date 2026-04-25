import AdminLog from "../models/AdminLog.js";

export async function logAction(adminEmail, action, target = null) {
  try {
    await AdminLog.create({
      adminEmail,
      action,
      target,
      date: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur logAction :", error);
  }
}