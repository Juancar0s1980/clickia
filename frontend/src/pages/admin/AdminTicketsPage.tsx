import { useState } from "react";
import { RespondTicketModal } from "../../components/admin/RespondTicketModal";
import { TicketStatusBadge } from "../../components/tickets/TicketStatusBadge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { useAdminTickets, useUpdateTicketStatus } from "../../hooks/useAdmin";
import { extractErrorMessage } from "../../services/httpClient";
import { TicketEstado, TicketPrioridad, TicketWithUser } from "../../types/api";

const PRIORITY_STYLES: Record<TicketPrioridad, string> = {
  baja: "text-slate-500 dark:text-slate-400",
  media: "text-blue-600 dark:text-blue-400",
  alta: "text-amber-600 dark:text-amber-400",
  critica: "text-red-600 dark:text-red-400",
};

export function AdminTicketsPage() {
  const { data: tickets, isLoading } = useAdminTickets();
  const updateStatus = useUpdateTicketStatus();
  const [respondingTicket, setRespondingTicket] = useState<TicketWithUser | null>(null);

  async function handleRespond(values: { estado: TicketEstado; respuesta?: string }) {
    if (!respondingTicket) return;
    try {
      await updateStatus.mutateAsync({ id: respondingTicket.id, ...values });
      setRespondingTicket(null);
    } catch {
      // El error se muestra dentro del propio modal via updateStatus.error
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 overflow-y-auto p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Tickets de soporte</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Casos escalados desde el chat cuando la IA no resolvió el problema. Atiéndelos dejando una respuesta y
          actualizando su estado.
        </p>
      </div>

      <Card className="overflow-x-auto p-0">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Prioridad</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {(tickets ?? []).map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700 dark:text-slate-200">{t.ticket_number}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(t.fecha_creacion).toLocaleDateString("es-CO")}
                    </div>
                  </td>
                  <td className="max-w-[10rem] px-4 py-3 text-slate-600 dark:text-slate-300">
                    <div className="truncate">{t.user_nombre}</div>
                    <div className="truncate text-xs text-slate-400 dark:text-slate-500" title={t.user_email}>
                      {t.user_email}
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-600 dark:text-slate-300" title={t.descripcion}>
                    {t.descripcion}
                  </td>
                  <td className={`px-4 py-3 font-medium capitalize ${PRIORITY_STYLES[t.prioridad]}`}>{t.prioridad}</td>
                  <td className="px-4 py-3">
                    <TicketStatusBadge estado={t.estado} />
                    <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {t.respuesta ? "Respondido" : "Sin responder"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="secondary" onClick={() => setRespondingTicket(t)}>
                      {t.respuesta ? "Editar" : "Atender"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && (tickets ?? []).length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">No hay tickets todavía.</p>
        )}
      </Card>

      {respondingTicket && (
        <RespondTicketModal
          ticket={respondingTicket}
          isSubmitting={updateStatus.isPending}
          error={updateStatus.error ? extractErrorMessage(updateStatus.error) : null}
          onSubmit={handleRespond}
          onClose={() => setRespondingTicket(null)}
        />
      )}
    </div>
  );
}
