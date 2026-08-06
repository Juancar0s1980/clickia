import { useNavigate, useParams } from "react-router-dom";
import { ChatBubble } from "../../components/chat/ChatBubble";
import { Spinner } from "../../components/ui/Spinner";
import { useAdminConversationDetail } from "../../hooks/useAdmin";

export function AdminConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useAdminConversationDetail(id ?? null);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto p-6">
      <button onClick={() => navigate(-1)} className="w-fit text-sm text-primary hover:underline dark:text-blue-300">
        ← Volver
      </button>

      {isLoading && (
        <div className="flex justify-center p-6">
          <Spinner />
        </div>
      )}

      {data && (
        <>
          <div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Detalle de la conversación</h1>
            <p className="text-sm capitalize text-slate-500 dark:text-slate-400">Estado: {data.conversation.estado}</p>
          </div>
          <div className="flex flex-col gap-3">
            {data.messages.map((m) => (
              <div key={m.id}>
                <ChatBubble message={m} />
                <p className={`mt-1 text-xs text-slate-400 dark:text-slate-500 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                  {new Date(m.timestamp).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
