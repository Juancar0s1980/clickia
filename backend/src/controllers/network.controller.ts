import { Request, Response } from "express";
import { networkStatusService } from "../services/networkStatus.service";
import { asyncHandler } from "../utils/asyncHandler";

export const networkController = {
  getStatus: asyncHandler(async (req: Request, res: Response) => {
    const zone = typeof req.query.zone === "string" ? req.query.zone : undefined;
    const status = await networkStatusService.getStatus(zone);
    res.status(200).json(status);
  }),
};
