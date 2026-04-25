import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  filename:      { type: String, required: true },
  path:          { type: String, required: true },
  size:          Number,
  uploadedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  note:          { type: String, default: "" },
}, { timestamps: true });

const documentSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  project:        { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  uploadedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  currentVersion: { type: Number, default: 1 },
  filename:       { type: String, required: true },
  path:           { type: String, required: true },
  size:           Number,
  mimetype:       String,
  versions:       [versionSchema],
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
