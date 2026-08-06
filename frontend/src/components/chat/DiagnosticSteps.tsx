import { ReactNode } from "react";
import { ChatResponse } from "../../types/api";
import { NetworkStatusBadge } from "./NetworkStatusBadge";

function StepRow({ done, label, extra }: { done: boolean; label: string; extra?: ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={done ? "text-accent" : "text-slate-400"}>{done ? "✓" : "○"}</span>
      <span className={done ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}>{label}</span>
      {extra}
    </li>
  );
}

export function DiagnosticSteps({ result }: { result: ChatResponse }) {
  const hasSolution = result.matchedProblem !== null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Diagnóstico</p>
      <ul className="flex flex-col gap-1.5">
        <StepRow done label="Revisando tu problema" />
        <StepRow done label="Consultando estado del servicio" extra={<NetworkStatusBadge status={result.networkStatus} />} />
        <StepRow
          done={hasSolution}
          label={hasSolution ? `Solución encontrada: ${result.matchedProblem!.nombre}` : "Aplicando solución (pendiente de más detalle)"}
        />
      </ul>
    </div>
  );
}
