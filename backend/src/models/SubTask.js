import mongoose from "mongoose";

const SubTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },

    status: {
      type: String,
      enum: ["todo", "done"],
      default: "todo"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("SubTask", SubTaskSchema);