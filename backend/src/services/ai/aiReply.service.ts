import { KnowledgeMatch } from "../knowledgeBase.service";
import { NetworkStatus } from "../networkStatus.service";
import { WeatherSnapshot } from "../weather.service";
import { Message } from "../../models/message.model";
import { Plan } from "../../models/plan.model";
import { buildDiagnosticReply } from "../replyComposer";
import { buildUserPrompt, SYSTEM_INSTRUCTION } from "./promptBuilder";
import { resolveAiProvider } from "./provider";

export interface AiReplyResult {
  text: string;
  source: string; // nombre del proveedor (ej. "groq", "gemini") o "fallback_template"
}

// Orquesta la generacion: RAG (contexto ya recuperado por knowledgeBase + networkStatus + plan.service
// + weather.service, mas el historial de la conversacion) -> LLM. Si no hay proveedor configurado o
// la llamada falla, degrada a la plantilla deterministica en vez de romper el chat.
export async function generateAiReply(
  userMessage: string,
  match: KnowledgeMatch | null,
  networkStatus: NetworkStatus,
  plans: Plan[] | null = null,
  history: Message[] = [],
  weather: WeatherSnapshot | null = null,
): Promise<AiReplyResult> {
  const provider = resolveAiProvider();

  if (provider) {
    const prompt = buildUserPrompt(userMessage, match, networkStatus, plans, history, weather);
    const text = await provider.generateReply(SYSTEM_INSTRUCTION, prompt);
    if (text) {
      return { text, source: provider.name };
    }
  }

  return { text: buildDiagnosticReply(match, networkStatus, plans, history, weather), source: "fallback_template" };
}
