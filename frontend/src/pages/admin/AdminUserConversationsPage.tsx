import { Link, useNavigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { useAdminUserConversations } from "../../hooks/useAdmin";

export function AdminUserConversationsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useAdminUserConversations(userId ?? null);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto p-6">
      <div>
        <Link to="/admin" className="text-sm text-primary hover:underline">
          ← Volver a usuarios
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-800">Conversaciones del usuario</h1>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading && (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        )}
        {!isLoading && (conversations ?? []).length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">Este usuario aún no tiene conversaciones.</p>
        )}
        <ul className="divide-y divide-slate-100">
          {(conversations ?? []).map((c) => (
            <li key={c.id}>
              <button
                onClick={() => navigate(`/admin/conversations/${c.id}`)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50"
              >
                <span>{new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</span>
                <span className="text-xs capitalize text-slate-500">{c.estado}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
