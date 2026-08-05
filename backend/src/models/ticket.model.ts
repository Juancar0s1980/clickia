export type TicketPrioridad = "baja" | "media" | "alta" | "critica";
export type TicketEstado = "abierto" | "en_proceso" | "resuelto" | "cerrado";

export interface Ticket {
  id: string;
  user_id: string;
  conversation_id: string | null;
  ticket_number: string;
  descripcion: string;
  prioridad: TicketPrioridad;
  estado: TicketEstado;
  fecha_creacion: Date;
  updated_at: Date;
}
