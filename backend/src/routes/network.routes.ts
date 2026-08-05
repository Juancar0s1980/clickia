import { Router } from "express";
import { networkController } from "../controllers/network.controller";

const router = Router();

router.get("/status", networkController.getStatus);

export default router;
