import { Conversation } from "../../types/api";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

const ESTADO_LABELS: Record<Conversation["estado"], string> = {
  abierta: "Abierta",
  resuelta: "Resuelta",
  escalada: "Escalada",
  cerrada: "Cerrada",
};

interface ConversationSidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  conversations,
  isLoading,
  activeConversationId,
  onSelect,
  onNewConversation,
}: ConversationSidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
      <div className="p-3">
        <Button variant="accent" className="w-full" onClick={onNewConversation}>
          + Nueva consulta
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}
        {!isLoading && conversations.length === 0 && (
          <p className="p-4 text-sm text-slate-400 dark:text-slate-500">Aún no tienes conversaciones.</p>
        )}
        <ul className="flex flex-col gap-1">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                onClick={() => onSelect(conversation.id)}
                className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${
                  activeConversationId === conversation.id
                    ? "bg-slate-200 dark:bg-slate-700"
                    : ""
                }`}
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {new Date(conversation.fecha_inicio).toLocaleString("es-CO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{ESTADO_LABELS[conversation.estado]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
