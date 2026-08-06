import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ZONES } from "../../constants/zones";
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
  direccion: z.string().trim().min(5, "Ingresa la dirección de la casa del cliente"),
  zona: z.enum(ZONES, { errorMap: () => ({ message: "Selecciona la zona del cliente" }) }),
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipoServicio: "wifi", zona: ZONES[0] },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Registrar usuario</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nombre completo" error={errors.nombre?.message} {...register("nombre")} />
        <Input label="Correo electrónico" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Contraseña" type="password" error={errors.password?.message} {...register("password")} />
        <Input
          label="Dirección de la casa del cliente"
          error={errors.direccion?.message}
          {...register("direccion")}
        />
        <Input label="Teléfono (opcional)" type="tel" {...register("telefono")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="tipoServicio" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Tipo de servicio contratado
          </label>
          <select
            id="tipoServicio"
            {...register("tipoServicio")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            {(Object.keys(SERVICE_LABELS) as TipoServicio[]).map((value) => (
              <option key={value} value={value}>
                {SERVICE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="zona" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Zona del cliente
          </label>
          <select
            id="zona"
            {...register("zona")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            {ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
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
