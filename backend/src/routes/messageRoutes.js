import { Router } from "express";
import { sendMessage, getMessages, markAsRead, deleteMessage } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router({ mergeParams: true });
router.use(protect);

router.post("/", sendMessage);
router.get("/", getMessages);
router.patch("/read", markAsRead);
router.delete("/:messageId", deleteMessage);

export default router;
