import { TicketEstado } from "../../types/api";

const STATUS_STYLES: Record<TicketEstado, string> = {
  abierto: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  en_proceso: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  resuelto: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  cerrado: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const STATUS_LABELS: Record<TicketEstado, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

export function TicketStatusBadge({ estado }: { estado: TicketEstado }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[estado]}`}>
      {STATUS_LABELS[estado]}
    </span>
  );
}
