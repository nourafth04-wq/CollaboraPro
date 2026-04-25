import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema({
  adminEmail: { type: String, required: true },
  action:     { type: String, required: true },
  target:     { type: String, default: null },
  date:       { type: Date, default: Date.now },
});

export default mongoose.model("AdminLog", AdminLogSchema);
