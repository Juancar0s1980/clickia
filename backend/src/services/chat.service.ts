import { conversationRepository } from "../repositories/conversation.repository";
import { messageRepository } from "../repositories/message.repository";
import { ApiError } from "../utils/ApiError";
import { knowledgeBaseService } from "./knowledgeBase.service";
import { networkStatusService } from "./networkStatus.service";
import { buildDiagnosticReply } from "./replyComposer";

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

    // Flujo de diagnostico: clasificar -> consultar base de conocimiento -> consultar estado del servicio -> responder.
    const match = await knowledgeBaseService.findRelevantProblem(input.message);
    const networkStatus = networkStatusService.getStatus(input.zone);
    const replyText = buildDiagnosticReply(match, networkStatus);

    const aiMessage = await messageRepository.create(conversation.id, "ai", replyText);

    return {
      conversation,
      reply: aiMessage,
      matchedProblem: match?.problem ?? null,
      networkStatus,
    };
  },
};
