import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, inviteMember, removeMember } from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(protect);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/members", inviteMember);
router.delete("/:id/members/:userId", removeMember);

export default router;
