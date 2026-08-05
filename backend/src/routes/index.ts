import { Router } from "express";
import authRoutes from "./auth.routes";
import chatRoutes from "./chat.routes";
import conversationRoutes from "./conversation.routes";
import networkRoutes from "./network.routes";
import ticketRoutes from "./ticket.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/conversations", conversationRoutes);
router.use("/chat", chatRoutes);
router.use("/tickets", ticketRoutes);
router.use("/network", networkRoutes);

export default router;
