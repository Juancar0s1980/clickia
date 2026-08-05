import { conversationRepository } from "../repositories/conversation.repository";
import { messageRepository } from "../repositories/message.repository";
import { ApiError } from "../utils/ApiError";
import { generateAiReply } from "./ai/aiReply.service";
import { knowledgeBaseService } from "./knowledgeBase.service";
import { networkStatusService } from "./networkStatus.service";

export const chatService = {
  async sendMessage(input: {
    userId: string;
    conversationId?: string;
    message: string;
    zone?: string;
  }) {
    const conversation = input.conversationId
      ? await conversationRepository.findById(input.conversationId)
      : await conversationRepository.create(input.userId);

    if (!conversation || conversation.user_id !== input.userId) {
      throw ApiError.notFound("Conversación no encontrada");
    }

    await messageRepository.create(conversation.id, "user", input.message);

    // Flujo de diagnostico: clasificar -> consultar base de conocimiento -> consultar estado del servicio -> generar respuesta (RAG).
    const match = await knowledgeBaseService.findRelevantProblem(input.message);
    const networkStatus = networkStatusService.getStatus(input.zone);
    const aiReply = await generateAiReply(input.message, match, networkStatus);

    const aiMessage = await messageRepository.create(conversation.id, "ai", aiReply.text);

    return {
      conversation,
      reply: aiMessage,
      matchedProblem: match?.problem ?? null,
      networkStatus,
      source: aiReply.source,
    };
  },
};
