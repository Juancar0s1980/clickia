import { conversationRepository } from "../repositories/conversation.repository";
import { diagnosticRepository } from "../repositories/diagnostic.repository";
import { messageRepository } from "../repositories/message.repository";
import { statsRepository } from "../repositories/stats.repository";
import { ticketRepository } from "../repositories/ticket.repository";
import { userRepository } from "../repositories/user.repository";
import { PublicUser, TipoServicio, toPublicUser, Zona } from "../models/user.model";
import { TicketEstado } from "../models/ticket.model";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";
import { geocodingService } from "./geocoding.service";
import { networkStatusService } from "./networkStatus.service";
import { NetworkServiceStatus } from "../models/networkStatus.model";
import { createUserByAdminSchema } from "../validators/admin.validator";

const TOP_PROBLEMS_LIMIT = 10;

export const adminService = {
  async createUser(input: {
    nombre: string;
    email: string;
    password: string;
    direccion: string;
    zona: Zona;
    telefono?: string;
    tipoServicio: TipoServicio;
  }): Promise<PublicUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("Ya existe una cuenta con ese correo");
    }

    const passwordHash = await hashPassword(input.password);
    const geocode = (await geocodingService.geocodeAddress(input.direccion, input.zona)) ?? undefined;
    const user = await userRepository.create({
      nombre: input.nombre,
      email: input.email,
      passwordHash,
      direccion: input.direccion,
      zona: input.zona,
      telefono: input.telefono,
      role: "user",
      tipoServicio: input.tipoServicio,
      geocode,
    });

    return toPublicUser(user);
  },

  async listUsers(): Promise<PublicUser[]> {
    const users = await userRepository.findAll();
    return users.map(toPublicUser);
  },

  // Borrado logico (ver comentario en user.repository.setActivo). Un admin no puede
  // desactivarse a si mismo -- evita que se quede sin forma de reactivar su propia cuenta.
  async setUserActivo(userId: string, requestingAdminId: string, activo: boolean): Promise<PublicUser> {
    if (userId === requestingAdminId && !activo) {
      throw ApiError.badRequest("No puedes desactivar tu propia cuenta de administrador");
    }

    const user = await userRepository.setActivo(userId, activo);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado");
    }
    return toPublicUser(user);
  },

  // Carga masiva (CSV importado y parseado en el frontend). Cada fila se valida y se
  // procesa de forma independiente: una fila invalida (email duplicado, columnas mal
  // formadas) no debe tumbar el resto del lote.
  async bulkCreateUsers(
    rows: unknown[],
  ): Promise<{ created: PublicUser[]; errors: Array<{ row: number; email: string; error: string }> }> {
    const created: PublicUser[] = [];
    const errors: Array<{ row: number; email: string; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const emailForError = (raw as { email?: string })?.email ?? "";
      const parsed = createUserByAdminSchema.safeParse(raw);

      if (!parsed.success) {
        errors.push({
          row: i + 1,
          email: emailForError,
          error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "),
        });
        continue;
      }

      try {
        created.push(await this.createUser(parsed.data));
      } catch (err) {
        errors.push({
          row: i + 1,
          email: parsed.data.email,
          error: err instanceof ApiError ? err.message : "No se pudo crear el usuario",
        });
      }
    }

    return { created, errors };
  },

  async getUserConversations(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado");
    }
    return conversationRepository.listByUser(userId);
  },

  // A diferencia de conversationService.getWithMessages, no valida propietario:
  // un admin puede abrir el detalle de cualquier conversacion.
  async getConversationDetail(conversationId: string) {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) {
      throw ApiError.notFound("Conversación no encontrada");
    }
    const messages = await messageRepository.listByConversation(conversationId);
    return { conversation, messages };
  },

  async listNetworkStatus() {
    return networkStatusService.listAll();
  },

  async updateNetworkStatus(zone: string, status: NetworkServiceStatus, estimatedTime: string | null) {
    return networkStatusService.setStatus(zone, status, estimatedTime);
  },

  async getSummary() {
    return statsRepository.getSummary();
  },

  async getTopProblems() {
    const rows = await diagnosticRepository.topProblems(TOP_PROBLEMS_LIMIT);
    return rows.map((r) => ({
      problemId: r.problem_id,
      nombre: r.nombre,
      categoria: r.categoria,
      total: Number(r.total),
    }));
  },

  async listTickets() {
    return ticketRepository.findAllWithUser();
  },

  async updateTicketStatus(ticketId: string, estado: TicketEstado, respuesta?: string) {
    const ticket = await ticketRepository.respond(ticketId, estado, respuesta);
    if (!ticket) {
      throw ApiError.notFound("Ticket no encontrado");
    }
    return ticket;
  },
};
