import { FormEvent, useState } from "react";
import { TicketPrioridad } from "../../types/api";
import { Button } from "../ui/Button";
import { ErrorBanner } from "../ui/ErrorBanner";

interface CreateTicketPanelProps {
  defaultDescription: string;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (descripcion: string, prioridad: TicketPrioridad) => void;
  onCancel: () => void;
}

const PRIORITIES: TicketPrioridad[] = ["baja", "media", "alta", "critica"];

export function CreateTicketPanel({ defaultDescription, isSubmitting, error, onSubmit, onCancel }: CreateTicketPanelProps) {
  const [descripcion, setDescripcion] = useState(defaultDescription);
  const [prioridad, setPrioridad] = useState<TicketPrioridad>("media");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (descripcion.trim().length < 10) return;
    onSubmit(descripcion.trim(), prioridad);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-700">Escalar a soporte técnico</p>
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={3}
        minLength={10}
        maxLength={2000}
        placeholder="Describe brevemente el problema para el técnico..."
        className="resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
      />
      <div className="flex items-center gap-3">
        <label htmlFor="prioridad" className="text-sm text-slate-600">
          Prioridad
        </label>
        <select
          id="prioridad"
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value as TicketPrioridad)}
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-primary"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting} disabled={descripcion.trim().length < 10}>
          Crear ticket
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
