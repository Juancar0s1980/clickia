import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/ui/Logo";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../services/httpClient";

const loginSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo").email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-1 text-center text-lg font-semibold text-slate-800">Bienvenido de nuevo</h1>
        <p className="mb-6 text-center text-sm text-slate-500">Inicia sesión para continuar con tu soporte técnico</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {serverError && <ErrorBanner message={serverError} />}

          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            Iniciar sesión
          </Button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Recuperar contraseña
          </Link>
          <Link to="/register" className="text-primary hover:underline">
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
