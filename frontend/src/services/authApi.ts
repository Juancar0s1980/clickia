import { User } from "../types/api";
import { httpClient } from "./httpClient";

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  async register(input: { nombre: string; email: string; password: string; telefono?: string }): Promise<User> {
    const { data } = await httpClient.post<{ user: User }>("/users", input);
    return data.user;
  },

  async login(email: string, password: string): Promise<LoginResult> {
    const { data } = await httpClient.post<LoginResult>("/auth/login", { email, password });
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await httpClient.post("/auth/logout", { refreshToken });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await httpClient.patch("/users/me/password", { currentPassword, newPassword });
  },
};
