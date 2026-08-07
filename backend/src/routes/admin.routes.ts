import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  bulkCreateUsersSchema,
  createUserByAdminSchema,
  updateNetworkStatusSchema,
  updateTicketStatusSchema,
  updateUserStatusSchema,
} from "../validators/admin.validator";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/users", validateBody(createUserByAdminSchema), adminController.createUser);
router.post("/users/bulk", validateBody(bulkCreateUsersSchema), adminController.bulkCreateUsers);
router.get("/users", adminController.listUsers);
router.patch("/users/:id/estado", validateBody(updateUserStatusSchema), adminController.updateUserStatus);
router.get("/users/:userId/conversations", adminController.getUserConversations);
router.get("/conversations/:id", adminController.getConversationDetail);

router.get("/network-status", adminController.listNetworkStatus);
router.patch("/network-status/:zone", validateBody(updateNetworkStatusSchema), adminController.updateNetworkStatus);

router.get("/stats/summary", adminController.getSummary);
router.get("/stats/top-problems", adminController.getTopProblems);

router.get("/tickets", adminController.listTickets);
router.patch("/tickets/:id", validateBody(updateTicketStatusSchema), adminController.updateTicketStatus);

export default router;
