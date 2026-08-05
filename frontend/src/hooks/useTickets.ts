import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketsApi } from "../services/ticketsApi";

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
