import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const subTaskSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  status:      { type: String, enum: ["todo", "doing", "done"], default: "todo" },
  priority:    { type: String, enum: ["low", "medium", "high"], default: "medium" },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  assignee:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deadline:    { type: Date, default: null },
  comments:    [commentSchema],
  subTasks:    [subTaskSchema],
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
