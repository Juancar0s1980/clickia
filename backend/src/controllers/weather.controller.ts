import { Request, Response } from "express";
import { weatherService } from "../services/weather.service";
import { asyncHandler } from "../utils/asyncHandler";

export const weatherController = {
  getCurrent: asyncHandler(async (req: Request, res: Response) => {
    const zone = typeof req.query.zone === "string" ? req.query.zone : undefined;
    const weather = zone ? await weatherService.getCurrent(zone) : null;
    res.status(200).json({ weather });
  }),
};
