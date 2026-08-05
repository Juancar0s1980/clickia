import { Ticket, TicketPrioridad } from "../types/api";
import { httpClient } from "./httpClient";

export const ticketsApi = {
  async create(input: { conversationId?: string; descripcion: string; prioridad?: TicketPrioridad }): Promise<Ticket> {
    const { data } = await httpClient.post<{ ticket: Ticket }>("/tickets", input);
    return data.ticket;
  },

  async list(): Promise<Ticket[]> {
    const { data } = await httpClient.get<{ tickets: Ticket[] }>("/tickets");
    return data.tickets;
  },
};
