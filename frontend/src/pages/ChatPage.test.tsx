import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatResponse, Ticket } from "../types/api";
import { ChatPage } from "./ChatPage";

const sendMessageMock = vi.fn();
const createTicketMock = vi.fn();

vi.mock("../hooks/useConversations", () => ({
  useConversations: () => ({ data: [], isLoading: false }),
  useConversation: () => ({ data: undefined, isLoading: false }),
}));

vi.mock("../hooks/useChat", () => ({
  useSendMessage: () => ({ mutateAsync: sendMessageMock, isPending: false }),
}));

vi.mock("../hooks/useTickets", () => ({
  useCreateTicket: () => ({ mutateAsync: createTicketMock, isPending: false, error: null }),
}));

const CHAT_RESPONSE: ChatResponse = {
  conversation: {
    id: "conv-1",
    user_id: "user-1",
    estado: "abierta",
    fecha_inicio: "2026-01-01T10:00:00.000Z",
    updated_at: "2026-01-01T10:00:00.000Z",
  },
  reply: {
    id: "msg-ai-1",
    conversation_id: "conv-1",
    sender: "ai",
    message: "Vamos a diagnosticar tu problema de conexión.",
    timestamp: "2026-01-01T10:00:01.000Z",
  },
  matchedProblem: {
    id: "problem-1",
    nombre: "Internet sin conexión",
    categoria: "conectividad",
    descripcion: "El usuario no tiene acceso a internet.",
    nivel: "alto",
  },
  networkStatus: { zone: "Centro", service: "internet", status: "operativo", estimated_time: null },
  source: "fallback_template",
};

const TICKET: Ticket = {
  id: "ticket-1",
  user_id: "user-1",
  conversation_id: "conv-1",
  ticket_number: "TCK-000042",
  descripcion: "El internet sigue sin funcionar tras los pasos sugeridos.",
  prioridad: "media",
  estado: "abierto",
  fecha_creacion: "2026-01-01T10:05:00.000Z",
  updated_at: "2026-01-01T10:05:00.000Z",
};

function renderChat() {
  return render(
    <MemoryRouter>
      <ChatPage />
    </MemoryRouter>,
  );
}

describe("ChatPage", () => {
  beforeEach(() => {
    sendMessageMock.mockReset();
    createTicketMock.mockReset();
  });

  it("crea una conversación y muestra la respuesta de IA con el diagnóstico al usar un botón rápido", async () => {
    sendMessageMock.mockResolvedValueOnce(CHAT_RESPONSE);
    renderChat();

    await userEvent.click(screen.getByRole("button", { name: "No tengo internet" }));

    expect(sendMessageMock).toHaveBeenCalledWith({
      conversationId: undefined,
      message: "No tengo internet",
      zone: "Centro",
    });

    expect(screen.getByText("No tengo internet", { selector: "div" })).toBeInTheDocument();
    expect(await screen.findByText(/vamos a diagnosticar tu problema de conexión/i)).toBeInTheDocument();
    expect(screen.getByText(/diagnóstico/i)).toBeInTheDocument();
    expect(screen.getByText(/solución encontrada: internet sin conexión/i)).toBeInTheDocument();
  });

  it("permite crear un ticket de soporte después de la respuesta de IA", async () => {
    sendMessageMock.mockResolvedValueOnce(CHAT_RESPONSE);
    createTicketMock.mockResolvedValueOnce(TICKET);
    renderChat();

    await userEvent.click(screen.getByRole("button", { name: "No tengo internet" }));
    await screen.findByText(/diagnóstico/i);

    await userEvent.click(screen.getByRole("button", { name: /crear ticket de soporte/i }));
    await userEvent.click(screen.getByRole("button", { name: "Crear ticket" }));

    await waitFor(() =>
      expect(createTicketMock).toHaveBeenCalledWith({
        conversationId: "conv-1",
        descripcion: "Internet sin conexión",
        prioridad: "media",
      }),
    );

    expect(await screen.findByText("TCK-000042")).toBeInTheDocument();
  });

  it("muestra un error y no bloquea el chat si el envío del mensaje falla", async () => {
    sendMessageMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { error: "Error interno del servidor" } },
    });
    renderChat();

    await userEvent.click(screen.getByRole("button", { name: "WiFi lento" }));

    expect(await screen.findByText(/error interno del servidor/i)).toBeInTheDocument();
  });
});
