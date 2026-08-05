import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate.middleware";
import { registerSchema } from "../validators/auth.validator";

const router = Router();

router.post("/", validateBody(registerSchema), authController.register);

export default router;
