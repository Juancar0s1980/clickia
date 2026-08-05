import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ticketService } from "../services/ticket.service";
import { asyncHandler } from "../utils/asyncHandler";

export const ticketController = {
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const ticket = await ticketService.create({
      userId: req.userId!,
      conversationId: req.body.conversationId,
      descripcion: req.body.descripcion,
      prioridad: req.body.prioridad,
    });
    res.status(201).json({ ticket });
  }),

  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const tickets = await ticketService.listForUser(req.userId!);
    res.status(200).json({ tickets });
  }),
};
