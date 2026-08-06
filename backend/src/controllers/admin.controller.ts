import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { adminService } from "../services/admin.service";
import { asyncHandler } from "../utils/asyncHandler";

export const adminController = {
  createUser: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await adminService.createUser(req.body);
    res.status(201).json({ user });
  }),

  listUsers: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const users = await adminService.listUsers();
    res.status(200).json({ users });
  }),

  bulkCreateUsers: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await adminService.bulkCreateUsers(req.body.rows);
    res.status(207).json(result);
  }),

  getUserConversations: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const conversations = await adminService.getUserConversations(req.params.userId!);
    res.status(200).json({ conversations });
  }),

  getConversationDetail: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await adminService.getConversationDetail(req.params.id!);
    res.status(200).json(result);
  }),

  listNetworkStatus: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const statuses = await adminService.listNetworkStatus();
    res.status(200).json({ statuses });
  }),

  updateNetworkStatus: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const status = await adminService.updateNetworkStatus(
      req.params.zone!,
      req.body.status,
      req.body.estimatedTime ?? null,
    );
    res.status(200).json({ status });
  }),

  getSummary: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const summary = await adminService.getSummary();
    res.status(200).json(summary);
  }),

  getTopProblems: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const problems = await adminService.getTopProblems();
    res.status(200).json({ problems });
  }),

  listTickets: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const tickets = await adminService.listTickets();
    res.status(200).json({ tickets });
  }),

  updateTicketStatus: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const ticket = await adminService.updateTicketStatus(req.params.id!, req.body.estado);
    res.status(200).json({ ticket });
  }),
};
