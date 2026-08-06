import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConversationStatusBadge } from "../components/chat/ConversationStatusBadge";
import { NetworkStatusBadge } from "../components/chat/NetworkStatusBadge";
import { WeatherBadge } from "../components/chat/WeatherBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { ZONES } from "../constants/zones";
import { useAuth } from "../context/AuthContext";
import { useConversations } from "../hooks/useConversations";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
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

  // El admin no es cliente del ISP: en vez del panel de "mi servicio", ve
  // estadisticas de la operacion. La rama se decide despues de llamar todos
  // los hooks para no romper las reglas de hooks entre renders.
  if (isAdmin) {
    return <AdminStatsPage />;
  }

  const recent = conversations?.slice(0, 8) ?? [];

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-6 overflow-y-auto p-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-6 text-white shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Hola, {user?.nombre?.split(" ")[0]}</h1>
            <p className="text-sm text-blue-100">Este es el estado de tu servicio y tus consultas recientes.</p>
            {user && (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                Tu plan: {SERVICE_LABELS[user.tipo_servicio]}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-100">Estado del servicio</span>
              <select
                value={zone}
                onChange={(e) => handleZoneChange(e.target.value)}
                className="rounded-lg border border-white/30 bg-white/10 px-2 py-1 text-sm text-white outline-none focus:border-white [&>option]:text-slate-900"
              >
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {isStatusLoading || !status ? <Spinner size="sm" /> : <NetworkStatusBadge status={status} />}
              {weather && <WeatherBadge weather={weather} />}
            </div>
          </div>
        </div>
      </div>

      <Card className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Historial de conversaciones</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Retoma una consulta anterior o empieza una nueva.</p>
          </div>
          <Button variant="accent" onClick={() => navigate("/chat")}>
            + Nueva consulta
          </Button>
        </div>

        {isConversationsLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}
        {!isConversationsLoading && recent.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
            Aún no tienes conversaciones. Crea la primera.
          </p>
        )}
        <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
          {recent.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => navigate("/chat", { state: { conversationId: c.id } })}
                className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span className="flex items-center gap-3">
                  <ConversationStatusBadge estado={c.estado} />
                  <span className="text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600">
                    →
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
