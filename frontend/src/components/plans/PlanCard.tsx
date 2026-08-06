import { Plan } from "../../types/api";

function formatPrice(precioMensual: number | null): string {
  if (precioMensual === null) return "Consulta con un asesor";
  return precioMensual.toLocaleString("es-CO");
}

interface ColumnProps {
  label: string;
  value: string;
  sub?: string;
}

function Column({ label, value, sub }: ColumnProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 py-4 text-center">
      <p className="text-sm font-bold text-primary dark:text-blue-300">{label}</p>
      <p className="text-2xl font-extrabold leading-tight text-accent dark:text-lime-400">{value}</p>
      {sub && <p className="text-xs font-semibold text-accent dark:text-lime-400">{sub}</p>}
    </div>
  );
}

export function PlanCard({ plan }: { plan: Plan }) {
  const isTriple = plan.categoria === "triple";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="px-4 pt-3 text-xs font-bold uppercase tracking-wide text-sky-400">
        Plan {plan.numero} · {plan.nombre}
      </p>

      {isTriple ? (
        <div className="flex divide-x divide-slate-200 dark:divide-slate-700">
          <Column label="Internet" value={`${plan.velocidad_mb} Mb`} />
          <Column label="TV HD" value={`+${plan.tv_canales}`} sub="Canales" />
          <Column label="Móvil" value={`${plan.moviles_gb} Gb`} />
        </div>
      ) : (
        <Column label={plan.incluye_tv ? "Internet + TV" : "Internet"} value={`${plan.velocidad_mb} Mb`} />
      )}

      <div className="mt-auto flex items-center justify-between bg-primary px-4 py-3 text-white dark:bg-primary-dark">
        <p className="text-2xl font-extrabold">
          {plan.precio_mensual !== null && <span className="mr-1 text-lg font-semibold">$</span>}
          {formatPrice(plan.precio_mensual)}
        </p>
        {plan.precio_mensual !== null && (
          <p className="text-right text-[10px] font-medium leading-tight text-blue-100">
            Cargo Fijo
            <br />
            Mensual
          </p>
        )}
      </div>

      <p className="px-4 py-2 text-[11px] italic leading-snug text-slate-400 dark:text-slate-500">{plan.nota}</p>
    </div>
  );
}
