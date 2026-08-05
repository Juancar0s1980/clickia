import { KnowledgeMatch } from "../knowledgeBase.service";
import { NetworkStatus } from "../networkStatus.service";
import { buildDiagnosticReply } from "../replyComposer";
import { buildUserPrompt, SYSTEM_INSTRUCTION } from "./promptBuilder";
import { resolveAiProvider } from "./provider";

export interface AiReplyResult {
  text: string;
  source: string; // nombre del proveedor (ej. "groq", "gemini") o "fallback_template"
}

// Orquesta la generacion: RAG (contexto ya recuperado por knowledgeBase + networkStatus) -> LLM.
// Si no hay proveedor configurado o la llamada falla, degrada a la plantilla deterministica
// en vez de romper el chat.
export async function generateAiReply(
  userMessage: string,
  match: KnowledgeMatch | null,
  networkStatus: NetworkStatus,
): Promise<AiReplyResult> {
  const provider = resolveAiProvider();

  if (provider) {
    const prompt = buildUserPrompt(userMessage, match, networkStatus);
    const text = await provider.generateReply(SYSTEM_INSTRUCTION, prompt);
    if (text) {
      return { text, source: provider.name };
    }
  }

  return { text: buildDiagnosticReply(match, networkStatus), source: "fallback_template" };
}
