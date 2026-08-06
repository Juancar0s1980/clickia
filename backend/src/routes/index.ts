import { Router } from "express";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import chatRoutes from "./chat.routes";
import conversationRoutes from "./conversation.routes";
import networkRoutes from "./network.routes";
import planRoutes from "./plan.routes";
import ticketRoutes from "./ticket.routes";
import userRoutes from "./user.routes";
import weatherRoutes from "./weather.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/conversations", conversationRoutes);
router.use("/chat", chatRoutes);
router.use("/tickets", ticketRoutes);
router.use("/network", networkRoutes);
router.use("/plans", planRoutes);
router.use("/weather", weatherRoutes);
router.use("/admin", adminRoutes);

export default router;
