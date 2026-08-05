import { Router } from "express";
import { ticketController } from "../controllers/ticket.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { createTicketSchema } from "../validators/ticket.validator";

const router = Router();

router.use(requireAuth);
router.post("/", validateBody(createTicketSchema), ticketController.create);
router.get("/", ticketController.list);

export default router;
