import { Conversation, Message, NetworkStatus, NetworkServiceStatus, TipoServicio, User } from "../types/api";
import { httpClient } from "./httpClient";

export const adminApi = {
  async createUser(input: {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    tipoServicio: TipoServicio;
  }): Promise<User> {
    const { data } = await httpClient.post<{ user: User }>("/admin/users", input);
    return data.user;
  },

  async listUsers(): Promise<User[]> {
    const { data } = await httpClient.get<{ users: User[] }>("/admin/users");
    return data.users;
  },

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data } = await httpClient.get<{ conversations: Conversation[] }>(`/admin/users/${userId}/conversations`);
    return data.conversations;
  },

  async getConversationDetail(conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const { data } = await httpClient.get<{ conversation: Conversation; messages: Message[] }>(
      `/admin/conversations/${conversationId}`,
    );
    return data;
  },

  async listNetworkStatus(): Promise<NetworkStatus[]> {
    const { data } = await httpClient.get<{ statuses: NetworkStatus[] }>("/admin/network-status");
    return data.statuses;
  },

  async updateNetworkStatus(
    zone: string,
    status: NetworkServiceStatus,
    estimatedTime: string | null,
  ): Promise<NetworkStatus> {
    const { data } = await httpClient.patch<{ status: NetworkStatus }>(`/admin/network-status/${zone}`, {
      status,
      estimatedTime,
    });
    return data.status;
  },
};
