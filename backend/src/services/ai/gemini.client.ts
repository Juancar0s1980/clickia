import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { AiProvider } from "./types";
import { withTimeout } from "./withTimeout";

const GENERATION_TIMEOUT_MS = 10_000;

const client = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

export const geminiProvider: AiProvider = {
  name: "gemini",

  isConfigured(): boolean {
    return client !== null;
  },

  async generateReply(systemInstruction: string, userPrompt: string): Promise<string | null> {
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
        "gemini generateContent",
      );
      return response.text?.trim() || null;
    } catch (err) {
      logger.error({ err }, "gemini generateContent failed");
      return null;
    }
  },
};
