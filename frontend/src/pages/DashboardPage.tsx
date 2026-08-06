import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NetworkStatusBadge } from "../components/chat/NetworkStatusBadge";
import { WeatherBadge } from "../components/chat/WeatherBadge";
import { TicketStatusBadge } from "../components/tickets/TicketStatusBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { ZONES } from "../constants/zones";
import { useAuth } from "../context/AuthContext";
import { useConversations } from "../hooks/useConversations";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useTickets } from "../hooks/useTickets";
import { useWeather } from "../hooks/useWeather";
import { zoneStorage } from "../services/zoneStorage";
import { TipoServicio } from "../types/api";
import { AdminStatsPage } from "./admin/AdminStatsPage";

const SERVICE_LABELS: Record<TipoServicio, string> = {
  wifi: "Internet / WiFi",
  tv: "TV",
  wifi_tv: "Internet + TV",
};

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [zone, setZone] = useState(zoneStorage.get() ?? ZONES[0]);

  function handleZoneChange(newZone: string) {
    setZone(newZone);
    zoneStorage.set(newZone);
  }

  const { data: status, isLoading: isStatusLoading } = useNetworkStatus(zone);
  const { data: weather } = useWeather(zone);
  const { data: conversations, isLoading: isConversationsLoading } = useConversations();
  const { data: tickets, isLoading: isTicketsLoading } = useTickets();

  // El admin no es cliente del ISP: en vez del panel de "mi servicio", ve
  // estadisticas de la operacion. La rama se decide despues de llamar todos
  // los hooks para no romper las reglas de hooks entre renders.
  if (isAdmin) {
    return <AdminStatsPage />;
  }

  const recent = conversations?.slice(0, 5) ?? [];

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-6 overflow-y-auto p-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-6 text-white shadow-sm">
        <h1 className="text-xl font-semibold">Hola, {user?.nombre?.split(" ")[0]}</h1>
        <p className="text-sm text-blue-100">Este es el estado de tu servicio y tus consultas recientes.</p>
        {user && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            Tu plan: {SERVICE_LABELS[user.tipo_servicio]}
          </span>
        )}
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Estado del servicio</h2>
          <select
            value={zone}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isStatusLoading || !status ? <Spinner size="sm" /> : <NetworkStatusBadge status={status} />}
          {weather && <WeatherBadge weather={weather} />}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Mis tickets</h2>
        {isTicketsLoading && <Spinner size="sm" />}
        {!isTicketsLoading && (tickets ?? []).length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            No tienes tickets abiertos. Se crean desde el chat cuando un problema no se resuelve.
          </p>
        )}
        <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
          {(tickets ?? []).map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">{t.ticket_number}</p>
                <p className="max-w-md truncate text-xs text-slate-500 dark:text-slate-400">{t.descripcion}</p>
              </div>
              <TicketStatusBadge estado={t.estado} />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Conversaciones recientes</h2>
          <Button variant="accent" onClick={() => navigate("/chat")}>
            + Nueva consulta
          </Button>
        </div>

        {isConversationsLoading && <Spinner size="sm" />}
        {!isConversationsLoading && recent.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">Aún no tienes conversaciones. Crea la primera.</p>
        )}
        <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
          {recent.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => navigate("/chat", { state: { conversationId: c.id } })}
                className="flex w-full items-center justify-between py-3 text-left text-sm text-slate-700 hover:text-primary dark:text-slate-300"
              >
                <span>
                  {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span className="text-xs capitalize text-slate-500 dark:text-slate-400">{c.estado}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
