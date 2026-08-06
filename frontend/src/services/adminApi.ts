import {
  Conversation,
  Message,
  NetworkStatus,
  NetworkServiceStatus,
  TicketEstado,
  TicketWithUser,
  TipoServicio,
  User,
} from "../types/api";
import { httpClient } from "./httpClient";

export interface AdminSummary {
  totalUsers: number;
  totalConversations: number;
  totalTickets: number;
  openTickets: number;
}

export interface TopProblem {
  problemId: string;
  nombre: string;
  categoria: string;
  total: number;
}

export interface BulkCreateUsersResult {
  created: User[];
  errors: Array<{ row: number; email: string; error: string }>;
}

export interface BulkUserRow {
  nombre: string;
  email: string;
  password: string;
  direccion: string;
  telefono?: string;
  tipoServicio: TipoServicio;
}

export const adminApi = {
  async createUser(input: {
    nombre: string;
    email: string;
    password: string;
    direccion: string;
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

  async bulkCreateUsers(rows: BulkUserRow[]): Promise<BulkCreateUsersResult> {
    const { data } = await httpClient.post<BulkCreateUsersResult>("/admin/users/bulk", { rows });
    return data;
  },

  async getSummary(): Promise<AdminSummary> {
    const { data } = await httpClient.get<AdminSummary>("/admin/stats/summary");
    return data;
  },

  async getTopProblems(): Promise<TopProblem[]> {
    const { data } = await httpClient.get<{ problems: TopProblem[] }>("/admin/stats/top-problems");
    return data.problems;
  },

  async listTickets(): Promise<TicketWithUser[]> {
    const { data } = await httpClient.get<{ tickets: TicketWithUser[] }>("/admin/tickets");
    return data.tickets;
  },

  async updateTicketStatus(id: string, estado: TicketEstado): Promise<TicketWithUser> {
    const { data } = await httpClient.patch<{ ticket: TicketWithUser }>(`/admin/tickets/${id}`, { estado });
    return data.ticket;
  },
};
