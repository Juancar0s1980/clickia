export type ConversationEstado = "abierta" | "resuelta" | "escalada" | "cerrada";

export interface Conversation {
  id: string;
  user_id: string;
  estado: ConversationEstado;
  fecha_inicio: Date;
  updated_at: Date;
}
