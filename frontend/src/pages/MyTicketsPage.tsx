import { useNavigate } from "react-router-dom";
import { TicketStatusBadge } from "../components/tickets/TicketStatusBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { useTickets } from "../hooks/useTickets";
import { TicketPrioridad } from "../types/api";

const PRIORITY_STYLES: Record<TicketPrioridad, string> = {
  baja: "text-slate-500 dark:text-slate-400",
  media: "text-blue-600 dark:text-blue-400",
  alta: "text-amber-600 dark:text-amber-400",
  critica: "text-red-600 dark:text-red-400",
};

export function MyTicketsPage() {
  const navigate = useNavigate();
  const { data: tickets, isLoading } = useTickets();

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Mis tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Se crean desde el chat cuando un problema no se resuelve con los pasos sugeridos.
          </p>
        </div>
        <Button variant="accent" onClick={() => navigate("/chat")}>
          + Nueva consulta
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {!isLoading && (tickets ?? []).length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
          No tienes tickets todavía. Si un problema no se resuelve por el chat, ahí mismo puedes escalarlo a soporte.
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {(tickets ?? []).map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{t.ticket_number}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(t.fecha_creacion).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium capitalize ${PRIORITY_STYLES[t.prioridad]}`}>{t.prioridad}</span>
                <TicketStatusBadge estado={t.estado} />
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t.descripcion}</p>

            {t.respuesta && (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                  Respuesta de soporte
                </p>
                <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">{t.respuesta}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
