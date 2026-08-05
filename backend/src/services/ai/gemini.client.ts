import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";

const GENERATION_TIMEOUT_MS = 10_000;

const client = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Gemini request timed out")), ms)),
  ]);
}

// Devuelve null si no hay API key configurada o si la llamada falla, para que el
// llamador pueda hacer fallback a la respuesta basada en plantilla sin romper el chat.
export async function generateGeminiReply(
  systemInstruction: string,
  userPrompt: string,
): Promise<string | null> {
  if (!client) {
    return null;
  }

  try {
    const response = await withTimeout(
      client.models.generateContent({
        model: env.geminiModel,
        contents: userPrompt,
        config: { systemInstruction },
      }),
      GENERATION_TIMEOUT_MS,
    );
    return response.text?.trim() || null;
  } catch (err) {
    console.error("[gemini] generateContent failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
