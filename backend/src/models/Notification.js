import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["task_assigned","task_comment","task_status_changed","project_invite","mention","document_uploaded"],
    required: true,
  },
  message:        { type: String, required: true },
  link:           { type: String, default: "" },
  read:           { type: Boolean, default: false },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
  relatedTask:    { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
