import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketsApi } from "../services/ticketsApi";

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useTickets() {
  return useQuery({ queryKey: ["tickets"], queryFn: ticketsApi.list });
}
