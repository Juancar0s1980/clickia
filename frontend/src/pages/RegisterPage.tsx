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
  direccion: z.string().min(5, "Ingresa la dirección de instalación"),
  telefono: z.string().optional(),
  aceptoDatos: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar el almacenamiento de tus datos y conversaciones para continuar",
  }),
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { aceptoDatos: false },
  });

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
          <Input
            label="Dirección de instalación"
            autoComplete="street-address"
            error={errors.direccion?.message}
            {...register("direccion")}
          />
          <Input label="Teléfono (opcional)" type="tel" autoComplete="tel" {...register("telefono")} />

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            Al crear tu cuenta, DobleClick almacenará tu nombre, datos de contacto, dirección y el
            historial de tus conversaciones con el chat, para poder brindarte soporte técnico.
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600"
              {...register("aceptoDatos")}
            />
            <span>Acepto que mis datos y conversaciones sean almacenados para este fin.</span>
          </label>
          {errors.aceptoDatos && <p className="-mt-2 text-xs text-red-600 dark:text-red-400">{errors.aceptoDatos.message}</p>}

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
