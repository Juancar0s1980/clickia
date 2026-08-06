import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { createUserByAdminSchema, updateNetworkStatusSchema } from "../validators/admin.validator";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/users", validateBody(createUserByAdminSchema), adminController.createUser);
router.get("/users", adminController.listUsers);
router.get("/users/:userId/conversations", adminController.getUserConversations);
router.get("/conversations/:id", adminController.getConversationDetail);

router.get("/network-status", adminController.listNetworkStatus);
router.patch("/network-status/:zone", validateBody(updateNetworkStatusSchema), adminController.updateNetworkStatus);

router.get("/stats/summary", adminController.getSummary);
router.get("/stats/top-problems", adminController.getTopProblems);

export default router;
