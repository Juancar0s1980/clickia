import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authApi } from "../../services/authApi";
import { extractErrorMessage } from "../../services/httpClient";
import { Button } from "../ui/Button";
import { ErrorBanner } from "../ui/ErrorBanner";
import { Input } from "../ui/Input";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h2 className="mb-1 text-lg font-semibold text-slate-800 dark:text-slate-100">Cambiar contraseña</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Este cambio no pasa por el chat: se procesa de forma segura y directa.
        </p>

        {success ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            Contraseña actualizada correctamente.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Contraseña actual"
              type="password"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
            <Input
              label="Nueva contraseña"
              type="password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {serverError && <ErrorBanner message={serverError} />}

            <div className="flex gap-2">
              <Button type="submit" isLoading={isSubmitting}>
                Guardar
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
