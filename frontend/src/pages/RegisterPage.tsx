import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/ui/Logo";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { authApi } from "../services/authApi";
import { extractErrorMessage } from "../services/httpClient";

const registerSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().min(1, "Ingresa tu correo").email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  telefono: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await authApi.register(values);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-slate-900 px-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-1 text-center text-lg font-semibold text-slate-800 dark:text-slate-100">Crear cuenta</h1>
        <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Regístrate para acceder al soporte inteligente
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nombre completo" autoComplete="name" error={errors.nombre?.message} {...register("nombre")} />
          <Input label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input label="Teléfono (opcional)" type="tel" autoComplete="tel" {...register("telefono")} />

          {serverError && <ErrorBanner message={serverError} />}
          {success && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
              Cuenta creada. Redirigiendo a inicio de sesión…
            </p>
          )}

          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            Crear cuenta
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary hover:underline dark:text-blue-300">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
