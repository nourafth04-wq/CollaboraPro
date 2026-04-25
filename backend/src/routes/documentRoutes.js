import { Router } from "express";
import { createRequire } from "module";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import { uploadDocument, getDocuments, downloadDocument, uploadNewVersion, getVersionHistory, downloadVersion, deleteDocument } from "../controllers/documentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const d = path.join(__dirname, "../../uploads");
    fs.mkdirSync(d, { recursive: true });
    cb(null, d);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const router = Router({ mergeParams: true });
router.use(protect);

router.post("/", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.get("/:docId/download", downloadDocument);
router.post("/:docId/versions", upload.single("file"), uploadNewVersion);
router.get("/:docId/versions", getVersionHistory);
router.get("/:docId/versions/:versionNumber/download", downloadVersion);
router.delete("/:docId", deleteDocument);

export default router;
