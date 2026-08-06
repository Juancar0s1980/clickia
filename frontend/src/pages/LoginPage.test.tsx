import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";

const loginMock = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ login: loginMock, isAuthenticated: false }),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it("muestra errores de validación si se envía vacío", async () => {
    renderLogin();

    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText(/ingresa tu correo/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("llama a login con las credenciales ingresadas", async () => {
    loginMock.mockResolvedValueOnce(undefined);
    renderLogin();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "clave12345");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith("user@example.com", "clave12345"));
  });

  it("muestra el error del servidor si el login falla", async () => {
    loginMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { error: "Credenciales inválidas" } },
    });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "clave-incorrecta");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
  });
});
