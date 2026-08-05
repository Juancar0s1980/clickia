import { env } from "../../config/env";
import { geminiProvider } from "./gemini.client";
import { groqProvider } from "./groq.client";
import { AiProvider } from "./types";

const PROVIDERS: Record<string, AiProvider> = {
  gemini: geminiProvider,
  groq: groqProvider,
};

// Sin AI_PROVIDER explicito, se autodetecta por la primera API key configurada
// (Groq primero: fue la que quedo activa tras agotarse los creditos de Gemini).
export function resolveAiProvider(): AiProvider | null {
  const forced = env.aiProvider && PROVIDERS[env.aiProvider];
  if (forced) {
    return forced;
  }

  return [groqProvider, geminiProvider].find((p) => p.isConfigured()) ?? null;
}
