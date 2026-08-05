import { ChatResponse } from "../types/api";
import { httpClient } from "./httpClient";

export const chatApi = {
  async sendMessage(input: { conversationId?: string; message: string; zone?: string }): Promise<ChatResponse> {
    const { data } = await httpClient.post<ChatResponse>("/chat", input);
    return data;
  },
};
