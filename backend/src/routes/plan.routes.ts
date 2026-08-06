import { Router } from "express";
import { planController } from "../controllers/plan.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", planController.list);

export default router;
