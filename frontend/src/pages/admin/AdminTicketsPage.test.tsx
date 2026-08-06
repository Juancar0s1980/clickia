import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TicketWithUser } from "../../types/api";
import { AdminTicketsPage } from "./AdminTicketsPage";

const updateStatusMock = vi.fn();

const TICKET: TicketWithUser = {
  id: "ticket-1",
  user_id: "user-1",
  conversation_id: "conv-1",
  ticket_number: "TCK-000001",
  descripcion: "El internet sigue caído tras los pasos sugeridos.",
  prioridad: "media",
  estado: "abierto",
  respuesta: null,
  fecha_respuesta: null,
  fecha_creacion: "2026-01-01T10:00:00.000Z",
  updated_at: "2026-01-01T10:00:00.000Z",
  user_nombre: "Cliente Uno",
  user_email: "cliente@example.com",
};

vi.mock("../../hooks/useAdmin", () => ({
  useAdminTickets: () => ({ data: [TICKET], isLoading: false }),
  useUpdateTicketStatus: () => ({ mutateAsync: updateStatusMock, isPending: false, error: null }),
}));

describe("AdminTicketsPage", () => {
  beforeEach(() => {
    updateStatusMock.mockReset();
  });

  it("lista los tickets con su estado y si tienen respuesta", () => {
    render(<AdminTicketsPage />);
    expect(screen.getByText("TCK-000001")).toBeInTheDocument();
    expect(screen.getByText("Cliente Uno")).toBeInTheDocument();
    expect(screen.getByText("Sin responder")).toBeInTheDocument();
  });

  it("permite escribir una respuesta y cambiar el estado en un solo envío", async () => {
    updateStatusMock.mockResolvedValueOnce({ ...TICKET, estado: "resuelto", respuesta: "Ya quedó operativo." });
    render(<AdminTicketsPage />);

    await userEvent.click(screen.getByRole("button", { name: "Atender" }));
    await userEvent.type(
      screen.getByLabelText(/respuesta para el cliente/i),
      "Ya quedó operativo.",
    );
    await userEvent.selectOptions(screen.getByLabelText(/^estado$/i), "resuelto");
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(updateStatusMock).toHaveBeenCalledWith({
        id: "ticket-1",
        estado: "resuelto",
        respuesta: "Ya quedó operativo.",
      }),
    );
  });
});
