import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../services/chatApi";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
