import Groq from "groq-sdk";
import { env } from "../../config/env";
import { AiProvider } from "./types";
import { withTimeout } from "./withTimeout";

const GENERATION_TIMEOUT_MS = 10_000;

const client = env.groqApiKey ? new Groq({ apiKey: env.groqApiKey }) : null;

export const groqProvider: AiProvider = {
  name: "groq",

  isConfigured(): boolean {
    return client !== null;
  },

  async generateReply(systemInstruction: string, userPrompt: string): Promise<string | null> {
    if (!client) {
      return null;
    }

    try {
      const completion = await withTimeout(
        client.chat.completions.create({
          model: env.groqModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
        GENERATION_TIMEOUT_MS,
        "groq chat.completions",
      );
      return completion.choices[0]?.message.content?.trim() || null;
    } catch (err) {
      console.error("[groq] chat.completions.create failed:", err instanceof Error ? err.message : err);
      return null;
    }
  },
};
