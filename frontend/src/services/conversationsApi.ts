import { Conversation, Message } from "../types/api";
import { httpClient } from "./httpClient";

export const conversationsApi = {
  async list(): Promise<Conversation[]> {
    const { data } = await httpClient.get<{ conversations: Conversation[] }>("/conversations");
    return data.conversations;
  },

  async getById(id: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const { data } = await httpClient.get<{ conversation: Conversation; messages: Message[] }>(
      `/conversations/${id}`,
    );
    return data;
  },
};
