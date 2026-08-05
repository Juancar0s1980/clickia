import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { conversationService } from "../services/conversation.service";
import { asyncHandler } from "../utils/asyncHandler";

export const conversationController = {
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const conversations = await conversationService.listForUser(req.userId!);
    res.status(200).json({ conversations });
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await conversationService.getWithMessages(req.params.id!, req.userId!);
    res.status(200).json(result);
  }),
};
