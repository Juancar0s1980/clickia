import { Router } from "express";
import { weatherController } from "../controllers/weather.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, weatherController.getCurrent);

export default router;
