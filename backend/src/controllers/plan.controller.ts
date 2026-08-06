import { Request, Response } from "express";
import { planService } from "../services/plan.service";
import { asyncHandler } from "../utils/asyncHandler";

export const planController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const plans = await planService.listAll();
    res.status(200).json(plans);
  }),
};
