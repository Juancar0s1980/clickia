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
  // En móvil el sidebar es un panel deslizable (drawer) en vez de una columna fija:
  // a 375px de ancho, w-72 (288px) fijo aplastaba el chat en una franja ilegible.
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationSidebar({
  conversations,
  isLoading,
  activeConversationId,
  onSelect,
  onNewConversation,
  isOpen,
  onClose,
}: ConversationSidebarProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-200 dark:border-slate-700 dark:bg-slate-900 md:static md:z-auto md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 p-3">
          <Button
            variant="accent"
            className="w-full"
            onClick={() => {
              onNewConversation();
              onClose();
            }}
          >
            + Nueva consulta
          </Button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar conversaciones"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
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
                  onClick={() => {
                    onSelect(conversation.id);
                    onClose();
                  }}
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
    </>
  );
}
