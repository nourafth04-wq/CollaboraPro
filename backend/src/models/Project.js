import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  status:      { type: String, enum: ["active", "completed", "archived"], default: "active" },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["admin", "team", "client"], default: "team" },
  }],
  deadline: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
