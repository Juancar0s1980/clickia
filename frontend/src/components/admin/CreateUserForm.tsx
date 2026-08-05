import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TipoServicio } from "../../types/api";
import { Button } from "../ui/Button";
import { ErrorBanner } from "../ui/ErrorBanner";
import { Input } from "../ui/Input";

const SERVICE_LABELS: Record<TipoServicio, string> = {
  wifi: "Solo Internet / WiFi",
  tv: "Solo TV",
  wifi_tv: "Internet + TV",
};

const schema = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre completo"),
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  telefono: z.string().trim().optional(),
  tipoServicio: z.enum(["wifi", "tv", "wifi_tv"]),
});

type FormValues = z.infer<typeof schema>;

interface CreateUserFormProps {
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}

export function CreateUserForm({ isSubmitting, error, onSubmit, onCancel }: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { tipoServicio: "wifi" } });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-700">Registrar usuario</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nombre completo" error={errors.nombre?.message} {...register("nombre")} />
        <Input label="Correo electrónico" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Contraseña" type="password" error={errors.password?.message} {...register("password")} />
        <Input label="Teléfono (opcional)" type="tel" {...register("telefono")} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tipoServicio" className="text-sm font-medium text-slate-700">
          Tipo de servicio contratado
        </label>
        <select
          id="tipoServicio"
          {...register("tipoServicio")}
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        >
          {(Object.keys(SERVICE_LABELS) as TipoServicio[]).map((value) => (
            <option key={value} value={value}>
              {SERVICE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          Crear usuario
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
