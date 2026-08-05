import { KnowledgeMatch } from "../knowledgeBase.service";
import { NetworkStatus } from "../networkStatus.service";
import { buildDiagnosticReply } from "../replyComposer";
import { generateGeminiReply } from "./gemini.client";
import { buildUserPrompt, SYSTEM_INSTRUCTION } from "./promptBuilder";

export interface AiReplyResult {
  text: string;
  source: "gemini" | "fallback_template";
}

// Orquesta la generacion: RAG (contexto ya recuperado por knowledgeBase + networkStatus) -> Gemini.
// Si Gemini no esta configurado o falla, degrada a la plantilla deterministica en vez de romper el chat.
export async function generateAiReply(
  userMessage: string,
  match: KnowledgeMatch | null,
  networkStatus: NetworkStatus,
): Promise<AiReplyResult> {
  const prompt = buildUserPrompt(userMessage, match, networkStatus);
  const geminiText = await generateGeminiReply(SYSTEM_INSTRUCTION, prompt);

  if (geminiText) {
    return { text: geminiText, source: "gemini" };
  }

  return { text: buildDiagnosticReply(match, networkStatus), source: "fallback_template" };
}
