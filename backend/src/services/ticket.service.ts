import { conversationRepository } from "../repositories/conversation.repository";
import { ticketRepository } from "../repositories/ticket.repository";
import { TicketPrioridad } from "../models/ticket.model";

export const ticketService = {
  async create(input: {
    userId: string;
    conversationId?: string;
    descripcion: string;
    prioridad?: TicketPrioridad;
  }) {
    const ticket = await ticketRepository.create({
      userId: input.userId,
      conversationId: input.conversationId ?? null,
      descripcion: input.descripcion,
      prioridad: input.prioridad ?? "media",
    });

    if (input.conversationId) {
      await conversationRepository.updateEstado(input.conversationId, "escalada");
    }

    return ticket;
  },

  async listForUser(userId: string) {
    return ticketRepository.listByUser(userId);
  },
};
