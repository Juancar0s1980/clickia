import { FormEvent, useState } from "react";
import { TicketStatusBadge } from "../tickets/TicketStatusBadge";
import { Button } from "../ui/Button";
import { ErrorBanner } from "../ui/ErrorBanner";
import { TicketEstado, TicketWithUser } from "../../types/api";

const ESTADO_OPTIONS: TicketEstado[] = ["abierto", "en_proceso", "resuelto", "cerrado"];

const ESTADO_LABELS: Record<TicketEstado, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

interface RespondTicketModalProps {
  ticket: TicketWithUser;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (values: { estado: TicketEstado; respuesta?: string }) => void;
  onClose: () => void;
}

export function RespondTicketModal({ ticket, isSubmitting, error, onSubmit, onClose }: RespondTicketModalProps) {
  const [estado, setEstado] = useState<TicketEstado>(ticket.estado);
  const [respuesta, setRespuesta] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ estado, respuesta: respuesta.trim() || undefined });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-800"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Atender {ticket.ticket_number}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {ticket.user_nombre} · {ticket.user_email}
            </p>
          </div>
          <TicketStatusBadge estado={ticket.estado} />
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Descripción del cliente
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{ticket.descripcion}</p>
          </div>

          {ticket.respuesta && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                Respuesta actual
              </p>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">{ticket.respuesta}</p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="respuesta" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {ticket.respuesta ? "Actualizar respuesta (opcional)" : "Respuesta para el cliente"}
            </label>
            <textarea
              id="respuesta"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Ej: Un técnico revisó el nodo de tu zona y ya quedó operativo."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="estado" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Estado
            </label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as TicketEstado)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {ESTADO_OPTIONS.map((e) => (
                <option key={e} value={e}>
                  {ESTADO_LABELS[e]}
                </option>
              ))}
            </select>
          </div>

          {error && <ErrorBanner message={error} />}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-5 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
