import { FormEvent, useState } from "react";
import { Button } from "../ui/Button";

export function ChatInput({ onSend, disabled }: { onSend: (message: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            handleSubmit(e);
          }
        }}
        placeholder="Describe tu problema..."
        rows={1}
        maxLength={1000}
        disabled={disabled}
        className="max-h-32 min-h-[42px] flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        Enviar
      </Button>
    </form>
  );
}
