import { Message } from "../../types/api";

export function ChatBubble({ message }: { message: Message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-sm bg-primary text-white"
            : "rounded-bl-sm bg-white text-slate-800 dark:bg-slate-700 dark:text-slate-100"
        }`}
      >
        {message.message}
      </div>
    </div>
  );
}
