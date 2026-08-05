import { Request, Response } from "express";
import { networkStatusService } from "../services/networkStatus.service";

export const networkController = {
  getStatus(req: Request, res: Response): void {
    const zone = typeof req.query.zone === "string" ? req.query.zone : undefined;
    res.status(200).json(networkStatusService.getStatus(zone));
  },
};
