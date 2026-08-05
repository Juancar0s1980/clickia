import { useQuery } from "@tanstack/react-query";
import { conversationsApi } from "../services/conversationsApi";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: conversationsApi.list,
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: () => conversationsApi.getById(id!),
    enabled: id !== null,
  });
}
