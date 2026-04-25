import AdminLog from "../models/AdminLog.js";

export const getLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error("Erreur GET /logs :", err);
    res.status(500).json({ error: "Impossible de charger les logs" });
  }
};
