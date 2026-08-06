import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ChangePasswordModal } from "../components/account/ChangePasswordModal";
import { ChatBubble } from "../components/chat/ChatBubble";
import { ChatInput } from "../components/chat/ChatInput";
import { ConversationSidebar } from "../components/chat/ConversationSidebar";
import { CreateTicketPanel } from "../components/chat/CreateTicketPanel";
import { DiagnosticSteps } from "../components/chat/DiagnosticSteps";
import { QuickActionButton } from "../components/chat/QuickActionButton";
import { TicketCreatedCard } from "../components/chat/TicketCreatedCard";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Spinner } from "../components/ui/Spinner";
import { ZONES } from "../constants/zones";
import { useAuth } from "../context/AuthContext";
import { useConversation, useConversations } from "../hooks/useConversations";
import { useSendMessage } from "../hooks/useChat";
import { useCreateTicket } from "../hooks/useTickets";
import { extractErrorMessage } from "../services/httpClient";
import { zoneStorage } from "../services/zoneStorage";
import { ChatResponse, Message, Ticket } from "../types/api";

const QUICK_ACTIONS = ["No tengo internet", "WiFi lento", "Mejorar mi plan"];

export function ChatPage() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const initialConversationId = (location.state as { conversationId?: string } | null)?.conversationId ?? null;

  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastResult, setLastResult] = useState<ChatResponse | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [zone, setZone] = useState<string | null>(() => zoneStorage.get());
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function selectZone(newZone: string) {
    zoneStorage.set(newZone);
    setZone(newZone);
  }

  const { data: conversations, isLoading: isConversationsLoading } = useConversations();
  const { data: loadedConversation, isLoading: isLoadingMessages } = useConversation(activeConversationId);
  const sendMessage = useSendMessage();
  const createTicket = useCreateTicket();

  // Cuando handleSend crea una conversacion nueva, activeConversationId pasa de null a un id
  // real y dispara por primera vez la consulta de useConversation. Sin esta bandera, el efecto
  // de sincronizacion se ejecuta justo despues y pisa con null el lastResult que acabamos de fijar.
  const suppressNextSyncRef = useRef(false);
  // Crear un ticket o enviar un mensaje invalida ["conversations"], lo que por prefijo de query key
  // tambien revalida ["conversations", id] de la conversacion activa. Sin este ref, ese refetch de
  // fondo se confunde con un cambio real de conversacion y borra el diagnostico/ticket ya mostrados.
  const lastSyncedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!loadedConversation) return;

    if (suppressNextSyncRef.current) {
      suppressNextSyncRef.current = false;
      lastSyncedConversationIdRef.current = loadedConversation.conversation.id;
      return;
    }

    setMessages(loadedConversation.messages);

    if (lastSyncedConversationIdRef.current !== loadedConversation.conversation.id) {
      setLastResult(null);
      setCreatedTicket(null);
      setShowTicketForm(false);
    }
    lastSyncedConversationIdRef.current = loadedConversation.conversation.id;
  }, [loadedConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleNewConversation() {
    setActiveConversationId(null);
    setMessages([]);
    setLastResult(null);
    setCreatedTicket(null);
    setShowTicketForm(false);
    setSendError(null);
  }

  async function handleSend(text: string) {
    setSendError(null);
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId ?? "",
      sender: "user",
      message: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setCreatedTicket(null);
    setShowTicketForm(false);

    try {
      const result = await sendMessage.mutateAsync({
        conversationId: activeConversationId ?? undefined,
        message: text,
        zone: zone ?? undefined,
      });
      if (activeConversationId === null) {
        suppressNextSyncRef.current = true;
      }
      setActiveConversationId(result.conversation.id);
      setMessages((prev) => [...prev, result.reply]);
      setLastResult(result);
    } catch (err) {
      setSendError(extractErrorMessage(err));
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
    }
  }

  async function handleCreateTicket(descripcion: string, prioridad: Ticket["prioridad"]) {
    try {
      const ticket = await createTicket.mutateAsync({
        conversationId: activeConversationId ?? undefined,
        descripcion,
        prioridad,
      });
      setCreatedTicket(ticket);
      setShowTicketForm(false);
    } catch {
      // El error se muestra dentro del propio panel via createTicket.error
    }
  }

  const isBusy = sendMessage.isPending;

  // El chat de soporte es para clientes; el admin gestiona todo desde /admin.
  // Se decide despues de llamar todos los hooks para no romper las reglas de hooks.
  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-full">
      <ConversationSidebar
        conversations={conversations ?? []}
        isLoading={isConversationsLoading}
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
        onNewConversation={handleNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Conversaciones
          </button>
        </div>
        {zone === null ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">¿En qué zona te encuentras?</p>
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                Lo necesitamos para revisar el estado del servicio en tu área antes de diagnosticar tu problema.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ZONES.map((z) => (
                  <Button key={z} variant="secondary" onClick={() => selectZone(z)}>
                    {z}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              {QUICK_ACTIONS.map((label) => (
                <QuickActionButton key={label} label={label} onClick={() => handleSend(label)} disabled={isBusy} />
              ))}
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cambiar contraseña
              </button>
              <Link
                to="/planes"
                className="rounded-full border border-accent bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-dark transition-colors hover:bg-accent/20 dark:border-lime-400 dark:bg-lime-400/10 dark:text-lime-300 dark:hover:bg-lime-400/20"
              >
                Ver todos los planes
              </Link>
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                Zona: {zone} ·{" "}
                <button type="button" onClick={() => setZone(null)} className="text-primary hover:underline dark:text-blue-300">
                  cambiar
                </button>
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {isLoadingMessages && (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              )}

              {!isLoadingMessages && messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                  <p className="text-sm">Cuéntame qué problema tienes con tu internet.</p>
                  <p className="text-xs">Puedes usar los botones rápidos de arriba o escribir tu propio mensaje.</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <ChatBubble key={m.id} message={m} />
                ))}
                {isBusy && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 shadow-sm dark:bg-slate-700">
                      <Spinner size="sm" />
                    </div>
                  </div>
                )}
              </div>

              {lastResult && (
                <div className="mt-4 flex flex-col gap-3">
                  <DiagnosticSteps result={lastResult} />
                  {!createdTicket && !showTicketForm && (
                    <Button variant="secondary" className="w-fit" onClick={() => setShowTicketForm(true)}>
                      ¿No se resolvió? Crear ticket de soporte
                    </Button>
                  )}
                  {showTicketForm && (
                    <CreateTicketPanel
                      defaultDescription={lastResult.matchedProblem?.nombre ?? ""}
                      isSubmitting={createTicket.isPending}
                      error={createTicket.error ? extractErrorMessage(createTicket.error) : null}
                      onSubmit={handleCreateTicket}
                      onCancel={() => setShowTicketForm(false)}
                    />
                  )}
                  {createdTicket && <TicketCreatedCard ticket={createdTicket} />}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              {sendError && (
                <div className="mb-2">
                  <ErrorBanner message={sendError} />
                </div>
              )}
              <ChatInput onSend={handleSend} disabled={isBusy} />
            </div>
          </>
        )}
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}
