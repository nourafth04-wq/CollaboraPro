import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  project:  { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:  { type: String, required: true, trim: true },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  readBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
