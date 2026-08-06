import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

export const authController = {
  register: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  }),

  login: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  }),

  refresh: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.status(200).json(result);
  }),

  logout: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(204).send();
  }),

  changePassword: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.userId!, currentPassword, newPassword);
    res.status(204).send();
  }),
};
