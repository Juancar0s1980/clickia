import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { aiGuard } from "../middleware/aiGuard.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { sendMessageSchema } from "../validators/chat.validator";

const router = Router();

router.post("/", requireAuth, validateBody(sendMessageSchema), aiGuard, chatController.sendMessage);

export default router;
