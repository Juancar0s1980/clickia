import { Router } from "express";
import { conversationController } from "../controllers/conversation.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", conversationController.list);
router.get("/:id", conversationController.getById);

export default router;
