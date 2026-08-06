import { Ticket } from "../../types/api";

const PRIORITY_LABELS: Record<Ticket["prioridad"], string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

export function TicketCreatedCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="rounded-xl border border-accent/40 bg-green-50 p-4 dark:border-accent/40 dark:bg-green-900/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark dark:text-accent">Ticket creado</p>
      <p className="mt-1 text-lg font-bold text-primary-dark dark:text-slate-100">{ticket.ticket_number}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700 dark:text-slate-200">
        <dt className="text-slate-500 dark:text-slate-400">Estado</dt>
        <dd className="capitalize">{ticket.estado.replace("_", " ")}</dd>
        <dt className="text-slate-500 dark:text-slate-400">Prioridad</dt>
        <dd>{PRIORITY_LABELS[ticket.prioridad]}</dd>
      </dl>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Un técnico revisará tu caso. Guarda el número de ticket para hacer seguimiento.
      </p>
    </div>
  );
}
