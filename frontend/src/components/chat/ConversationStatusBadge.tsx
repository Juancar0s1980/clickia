import { ConversationEstado } from "../../types/api";

const STATUS_STYLES: Record<ConversationEstado, string> = {
  abierta: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  resuelta: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  escalada: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  cerrada: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const STATUS_LABELS: Record<ConversationEstado, string> = {
  abierta: "Abierta",
  resuelta: "Resuelta",
  escalada: "Escalada",
  cerrada: "Cerrada",
};

export function ConversationStatusBadge({ estado }: { estado: ConversationEstado }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[estado]}`}>
      {STATUS_LABELS[estado]}
    </span>
  );
}
