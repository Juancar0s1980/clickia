import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { chatService } from "../services/chat.service";
import { asyncHandler } from "../utils/asyncHandler";

export const chatController = {
  sendMessage: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await chatService.sendMessage({
      userId: req.userId!,
      conversationId: req.body.conversationId,
      message: req.body.message,
      zone: req.body.zone,
    });
    res.status(200).json(result);
  }),
};
