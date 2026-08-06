import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NetworkStatusBadge } from "../components/chat/NetworkStatusBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { ZONES } from "../constants/zones";
import { useAuth } from "../context/AuthContext";
import { useConversations } from "../hooks/useConversations";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { zoneStorage } from "../services/zoneStorage";
import { AdminStatsPage } from "./admin/AdminStatsPage";

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [zone, setZone] = useState(zoneStorage.get() ?? ZONES[0]);

  function handleZoneChange(newZone: string) {
    setZone(newZone);
    zoneStorage.set(newZone);
  }

  const { data: status, isLoading: isStatusLoading } = useNetworkStatus(zone);
  const { data: conversations, isLoading: isConversationsLoading } = useConversations();

  // El admin no es cliente del ISP: en vez del panel de "mi servicio", ve
  // estadisticas de la operacion. La rama se decide despues de llamar todos
  // los hooks para no romper las reglas de hooks entre renders.
  if (isAdmin) {
    return <AdminStatsPage />;
  }

  const recent = conversations?.slice(0, 5) ?? [];

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-6 overflow-y-auto p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Hola, {user?.nombre?.split(" ")[0]}</h1>
        <p className="text-sm text-slate-500">Este es el estado de tu servicio y tus consultas recientes.</p>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Estado del servicio</h2>
          <select
            value={zone}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-primary"
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
        {isStatusLoading || !status ? <Spinner size="sm" /> : <NetworkStatusBadge status={status} />}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Conversaciones recientes</h2>
          <Button onClick={() => navigate("/chat")}>+ Nueva consulta</Button>
        </div>

        {isConversationsLoading && <Spinner size="sm" />}
        {!isConversationsLoading && recent.length === 0 && (
          <p className="text-sm text-slate-400">Aún no tienes conversaciones. Crea la primera.</p>
        )}
        <ul className="flex flex-col divide-y divide-slate-100">
          {recent.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => navigate("/chat", { state: { conversationId: c.id } })}
                className="flex w-full items-center justify-between py-3 text-left text-sm hover:text-primary"
              >
                <span>
                  {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span className="text-xs capitalize text-slate-500">{c.estado}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
