import { conversationRepository } from "../repositories/conversation.repository";
import { diagnosticRepository } from "../repositories/diagnostic.repository";
import { messageRepository } from "../repositories/message.repository";
import { ApiError } from "../utils/ApiError";
import { generateAiReply } from "./ai/aiReply.service";
import { ipLookupService } from "./ipLookup.service";
import { knowledgeBaseService } from "./knowledgeBase.service";
import { networkStatusService } from "./networkStatus.service";
import { planService } from "./plan.service";
import { OFF_TOPIC_REPLY, topicGuardService } from "./topicGuard.service";
import { weatherService } from "./weather.service";

export const chatService = {
  async sendMessage(input: {
    userId: string;
    conversationId?: string;
    message: string;
    zone?: string;
    ip?: string;
  }) {
    const conversation = input.conversationId
      ? await conversationRepository.findById(input.conversationId)
      : await conversationRepository.create(input.userId);

    if (!conversation || conversation.user_id !== input.userId) {
      throw ApiError.notFound("Conversación no encontrada");
    }

    // Se lee el historial ANTES de guardar el mensaje actual, para no duplicarlo: el mensaje
    // actual viaja aparte como "MENSAJE ACTUAL" en el prompt / se evalua por separado.
    const history = await messageRepository.listByConversation(conversation.id);

    await messageRepository.create(conversation.id, "user", input.message);

    // Filtro de tema ANTES de tocar la base de conocimiento o el LLM: si el mensaje no es
    // sobre el servicio del ISP (ni continua una conversacion que ya lo era), se responde
    // con un mensaje fijo y cordial sin gastar tokens del proveedor de IA.
    if (!topicGuardService.isOnTopic(input.message, history)) {
      const networkStatus = await networkStatusService.getStatus(input.zone);
      const aiMessage = await messageRepository.create(conversation.id, "ai", OFF_TOPIC_REPLY);

      return {
        conversation,
        reply: aiMessage,
        matchedProblem: null,
        networkStatus,
        source: "off_topic",
      };
    }

    // Flujo de diagnostico: clasificar (con memoria de la conversacion) -> consultar estado del
    // servicio -> consultar planes si aplica -> generar respuesta (RAG).
    const match = await knowledgeBaseService.findRelevantProblem(input.message, history);
    const networkStatus = await networkStatusService.getStatus(input.zone);
    const plans = await planService.findRelevantPlans(input.message, history);
    // El clima y el ISP detectado solo aportan como señal para un problema tecnico real
    // (no para consultas de cuenta/comerciales como "mejorar mi plan").
    const isTechnicalMatch = match !== null && match.problem.categoria !== "cuenta";
    const weather = isTechnicalMatch ? await weatherService.getCurrent(networkStatus.zone) : null;
    const ispInfo = isTechnicalMatch && input.ip ? await ipLookupService.getInfo(input.ip) : null;
    const aiReply = await generateAiReply(input.message, match, networkStatus, plans, history, weather, ispInfo);

    const aiMessage = await messageRepository.create(conversation.id, "ai", aiReply.text);

    // Alimenta las estadisticas de "fallas mas recurrentes" del panel de admin, y guarda
    // los datos relevantes obtenidos de la segunda/tercera API (clima, ISP) en vez de
    // descartarlos tras usarlos solo para la respuesta.
    await diagnosticRepository.create({
      conversationId: conversation.id,
      problemId: match?.problem.id ?? null,
      zone: networkStatus.zone,
      networkStatus: networkStatus.status,
      weatherDescription: weather?.description ?? null,
      weatherIsSevere: weather?.isSevere ?? null,
      ispName: ispInfo?.isp ?? null,
      ispCity: ispInfo?.city ?? null,
    });

    return {
      conversation,
      reply: aiMessage,
      matchedProblem: match?.problem ?? null,
      networkStatus,
      source: aiReply.source,
    };
  },
};
