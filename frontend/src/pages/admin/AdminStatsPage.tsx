import { BarChart } from "../../components/admin/BarChart";
import { StatTile } from "../../components/admin/StatTile";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { useAdminSummary, useAdminTopProblems } from "../../hooks/useAdmin";

export function AdminStatsPage() {
  const { data: summary, isLoading: isSummaryLoading } = useAdminSummary();
  const { data: topProblems, isLoading: isProblemsLoading } = useAdminTopProblems();

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-6 overflow-y-auto p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Panel de administración</h1>
        <p className="text-sm text-slate-500">Resumen general y fallas más recurrentes reportadas en el chat.</p>
      </div>

      {isSummaryLoading || !summary ? (
        <Spinner size="sm" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Usuarios" value={summary.totalUsers} />
          <StatTile label="Conversaciones" value={summary.totalConversations} />
          <StatTile label="Tickets totales" value={summary.totalTickets} />
          <StatTile label="Tickets abiertos" value={summary.openTickets} />
        </div>
      )}

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Fallas más recurrentes</h2>
        {isProblemsLoading && <Spinner size="sm" />}
        {!isProblemsLoading && (topProblems ?? []).length === 0 && (
          <p className="text-sm text-slate-400">Todavía no hay suficientes conversaciones para mostrar datos.</p>
        )}
        {!isProblemsLoading && (topProblems ?? []).length > 0 && (
          <BarChart items={(topProblems ?? []).map((p) => ({ label: p.nombre, value: p.total }))} />
        )}
      </Card>
    </div>
  );
}
