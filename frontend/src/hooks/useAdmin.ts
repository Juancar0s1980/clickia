import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../services/adminApi";
import { NetworkServiceStatus, TicketEstado } from "../types/api";

export function useAdminUsers() {
  return useQuery({ queryKey: ["admin", "users"], queryFn: adminApi.listUsers });
}

export function useCreateUserByAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useBulkCreateUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.bulkCreateUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminUserConversations(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "users", userId, "conversations"],
    queryFn: () => adminApi.getUserConversations(userId!),
    enabled: userId !== null,
  });
}

export function useAdminConversationDetail(conversationId: string | null) {
  return useQuery({
    queryKey: ["admin", "conversations", conversationId],
    queryFn: () => adminApi.getConversationDetail(conversationId!),
    enabled: conversationId !== null,
  });
}

export function useAdminNetworkStatus() {
  return useQuery({ queryKey: ["admin", "network-status"], queryFn: adminApi.listNetworkStatus });
}

export function useUpdateNetworkStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { zone: string; status: NetworkServiceStatus; estimatedTime: string | null }) =>
      adminApi.updateNetworkStatus(input.zone, input.status, input.estimatedTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "network-status"] });
    },
  });
}

export function useAdminSummary() {
  return useQuery({ queryKey: ["admin", "stats", "summary"], queryFn: adminApi.getSummary });
}

export function useAdminTopProblems() {
  return useQuery({ queryKey: ["admin", "stats", "top-problems"], queryFn: adminApi.getTopProblems });
}

export function useAdminTickets() {
  return useQuery({ queryKey: ["admin", "tickets"], queryFn: adminApi.listTickets });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; estado: TicketEstado; respuesta?: string }) =>
      adminApi.updateTicketStatus(input.id, input.estado, input.respuesta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats", "summary"] });
    },
  });
}
