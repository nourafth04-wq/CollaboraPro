import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Document from "../models/Document.js";
import Project from "../models/Project.js";
import { createNotification } from "../utils/notifyAction.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const isMemberOf = (p, uid) => p.members.some(m => m.user.toString() === uid);

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isMemberOf(project, req.user.id)) return res.status(403).json({ message: "Access denied." });
    const doc = await Document.create({
      name: req.body.name || req.file.originalname, project: project._id, uploadedBy: req.user.id,
      filename: req.file.filename, path: req.file.path, size: req.file.size, mimetype: req.file.mimetype,
      currentVersion: 1,
      versions: [{ versionNumber: 1, filename: req.file.filename, path: req.file.path, size: req.file.size, uploadedBy: req.user.id, note: "Initial upload" }],
    });
    for (const member of project.members)
      if (member.user.toString() !== req.user.id)
        await createNotification({ recipient: member.user, type: "document_uploaded", message: `New document "${doc.name}" in project "${project.name}".`, link: `/projects/${project._id}`, relatedProject: project._id });
    res.status(201).json({ message: "Document uploaded.", document: doc });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const getDocuments = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    if (!isMemberOf(project, req.user.id)) return res.status(403).json({ message: "Access denied." });
    const docs = await Document.find({ project: req.params.projectId }).populate("uploadedBy", "email").sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    const project = await Project.findById(doc.project);
    if (!isMemberOf(project, req.user.id)) return res.status(403).json({ message: "Access denied." });
    if (!fs.existsSync(doc.path)) return res.status(404).json({ message: "File not found on server." });
    res.download(doc.path, doc.filename);
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const uploadNewVersion = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    const project = await Project.findById(doc.project);
    if (!isMemberOf(project, req.user.id)) return res.status(403).json({ message: "Access denied." });
    const v = doc.currentVersion + 1;
    doc.versions.push({ versionNumber: v, filename: req.file.filename, path: req.file.path, size: req.file.size, uploadedBy: req.user.id, note: req.body.note || `Version ${v}` });
    doc.currentVersion = v; doc.filename = req.file.filename; doc.path = req.file.path;
    doc.size = req.file.size; doc.mimetype = req.file.mimetype;
    await doc.save();
    res.json({ message: `Version ${v} uploaded.`, document: doc });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const getVersionHistory = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId).populate("versions.uploadedBy", "email");
    if (!doc) return res.status(404).json({ message: "Document not found." });
    res.json({ versions: doc.versions, currentVersion: doc.currentVersion });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const downloadVersion = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    const version = doc.versions.find(v => v.versionNumber === parseInt(req.params.versionNumber));
    if (!version) return res.status(404).json({ message: "Version not found." });
    if (!fs.existsSync(version.path)) return res.status(404).json({ message: "File not found." });
    res.download(version.path, version.filename);
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    if (doc.uploadedBy.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized." });
    for (const v of doc.versions)
      if (fs.existsSync(v.path)) fs.unlinkSync(v.path);
    await doc.deleteOne();
    res.json({ message: "Document deleted." });
  } catch (err) { res.status(500).json({ message: "Server error.", error: err.message }); }
};
