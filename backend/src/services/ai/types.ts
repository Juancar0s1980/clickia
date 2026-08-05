export interface AiProvider {
  name: string;
  isConfigured(): boolean;
  generateReply(systemInstruction: string, userPrompt: string): Promise<string | null>;
}
