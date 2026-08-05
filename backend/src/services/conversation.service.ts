import { conversationRepository } from "../repositories/conversation.repository";
import { messageRepository } from "../repositories/message.repository";
import { ApiError } from "../utils/ApiError";

export const conversationService = {
  async listForUser(userId: string) {
    return conversationRepository.listByUser(userId);
  },

  async getWithMessages(conversationId: string, userId: string) {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation || conversation.user_id !== userId) {
      throw ApiError.notFound("Conversación no encontrada");
    }
    const messages = await messageRepository.listByConversation(conversationId);
    return { conversation, messages };
  },
};
