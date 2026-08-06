import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { changePasswordSchema, registerSchema } from "../validators/auth.validator";

const router = Router();

router.post("/", authRateLimiter, validateBody(registerSchema), authController.register);
router.patch("/me/password", requireAuth, validateBody(changePasswordSchema), authController.changePassword);

export default router;
