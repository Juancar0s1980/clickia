import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../../types/api";
import { AdminUsersPage } from "./AdminUsersPage";

const createUserMock = vi.fn();

const EXISTING_USER: User = {
  id: "user-1",
  nombre: "Cliente Existente",
  email: "cliente@example.com",
  telefono: null,
  direccion: "Calle 5 # 10-20, Popayán",
  zona: "Centro",
  direccion_lat: 2.4448,
  direccion_lon: -76.6147,
  direccion_formateada: "Calle 5 #10-20, Popayán, Cauca, Colombia",
  direccion_confianza: 8,
  acepto_datos: true,
  acepto_datos_at: "2026-01-01T10:00:00.000Z",
  role: "user",
  tipo_servicio: "wifi",
  activo: true,
  fecha_creacion: "2026-01-01T10:00:00.000Z",
  updated_at: "2026-01-01T10:00:00.000Z",
};

vi.mock("../../hooks/useAdmin", () => ({
  useAdminUsers: () => ({ data: [EXISTING_USER], isLoading: false }),
  useCreateUserByAdmin: () => ({ mutateAsync: createUserMock, isPending: false, error: null }),
  useBulkCreateUsers: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminUsersPage />
    </MemoryRouter>,
  );
}

describe("AdminUsersPage", () => {
  beforeEach(() => {
    createUserMock.mockReset();
  });

  it("lista los usuarios existentes", () => {
    renderPage();
    expect(screen.getByText("Cliente Existente")).toBeInTheDocument();
    expect(screen.getByText("cliente@example.com")).toBeInTheDocument();
  });

  it("permite registrar un usuario nuevo con su tipo de servicio", async () => {
    createUserMock.mockResolvedValueOnce({ ...EXISTING_USER, id: "user-2" });
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: /registrar usuario/i }));

    await userEvent.type(screen.getByLabelText(/nombre completo/i), "Cliente Nuevo");
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "nuevo@example.com");
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), "clave12345");
    await userEvent.type(screen.getByLabelText(/dirección de la casa del cliente/i), "Carrera 9 # 4-30, Popayán");
    await userEvent.selectOptions(screen.getByLabelText(/tipo de servicio/i), "tv");
    await userEvent.selectOptions(screen.getByLabelText(/zona del cliente/i), "Sur");

    await userEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

    await waitFor(() =>
      expect(createUserMock).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: "Cliente Nuevo",
          email: "nuevo@example.com",
          password: "clave12345",
          direccion: "Carrera 9 # 4-30, Popayán",
          zona: "Sur",
          tipoServicio: "tv",
        }),
      ),
    );
  });
});
