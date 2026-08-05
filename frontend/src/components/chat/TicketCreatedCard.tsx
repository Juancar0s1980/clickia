import { Ticket } from "../../types/api";

const PRIORITY_LABELS: Record<Ticket["prioridad"], string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

export function TicketCreatedCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="rounded-xl border border-primary/30 bg-blue-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Ticket creado</p>
      <p className="mt-1 text-lg font-bold text-primary-dark">{ticket.ticket_number}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700">
        <dt className="text-slate-500">Estado</dt>
        <dd className="capitalize">{ticket.estado.replace("_", " ")}</dd>
        <dt className="text-slate-500">Prioridad</dt>
        <dd>{PRIORITY_LABELS[ticket.prioridad]}</dd>
      </dl>
      <p className="mt-2 text-xs text-slate-500">
        Un técnico revisará tu caso. Guarda el número de ticket para hacer seguimiento.
      </p>
    </div>
  );
}
