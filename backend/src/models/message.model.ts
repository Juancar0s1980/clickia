export type MessageSender = "user" | "ai" | "system";

export interface Message {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  message: string;
  timestamp: Date;
}
