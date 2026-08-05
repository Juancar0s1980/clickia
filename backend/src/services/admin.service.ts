import { conversationRepository } from "../repositories/conversation.repository";
import { messageRepository } from "../repositories/message.repository";
import { userRepository } from "../repositories/user.repository";
import { PublicUser, TipoServicio, toPublicUser } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";
import { networkStatusService } from "./networkStatus.service";
import { NetworkServiceStatus } from "../models/networkStatus.model";

export const adminService = {
  async createUser(input: {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    tipoServicio: TipoServicio;
  }): Promise<PublicUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("Ya existe una cuenta con ese correo");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      nombre: input.nombre,
      email: input.email,
      passwordHash,
      telefono: input.telefono,
      role: "user",
      tipoServicio: input.tipoServicio,
    });

    return toPublicUser(user);
  },

  async listUsers(): Promise<PublicUser[]> {
    const users = await userRepository.findAll();
    return users.map(toPublicUser);
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
};
