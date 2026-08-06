export type UserRole = "user" | "admin";
export type TipoServicio = "wifi" | "tv" | "wifi_tv";

export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string;
  role: UserRole;
  tipo_servicio: TipoServicio;
  activo: boolean;
  fecha_creacion: string;
  updated_at: string;
}

export type ConversationEstado = "abierta" | "resuelta" | "escalada" | "cerrada";

export interface Conversation {
  id: string;
  user_id: string;
  estado: ConversationEstado;
  fecha_inicio: string;
  updated_at: string;
}

export type MessageSender = "user" | "ai" | "system";

export interface Message {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  message: string;
  timestamp: string;
}

export type ProblemNivel = "bajo" | "medio" | "alto";

export interface TechnicalProblem {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  nivel: ProblemNivel;
}

export type NetworkServiceStatus = "operativo" | "mantenimiento" | "falla";

export interface NetworkStatus {
  zone: string;
  service: string;
  status: NetworkServiceStatus;
  estimated_time: string | null;
}

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
  fecha_creacion: string;
  updated_at: string;
}

export interface TicketWithUser extends Ticket {
  user_nombre: string;
  user_email: string;
}

export interface ChatResponse {
  conversation: Conversation;
  reply: Message;
  matchedProblem: TechnicalProblem | null;
  networkStatus: NetworkStatus;
  source: string;
}

export type PlanCategoria = "doble" | "triple";

export interface Plan {
  id: string;
  numero: number;
  categoria: PlanCategoria;
  nombre: string;
  velocidad_mb: number;
  incluye_tv: boolean;
  tv_canales: number | null;
  moviles_gb: number | null;
  precio_mensual: number | null;
  nota: string;
  activo: boolean;
}

export interface Weather {
  zone: string;
  temperatureC: number;
  precipitationMm: number;
  weatherCode: number;
  description: string;
  isSevere: boolean;
}

export interface ApiErrorBody {
  error: string;
  details?: unknown;
}
