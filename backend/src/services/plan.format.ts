import { Plan } from "../models/plan.model";

// Formato compartido entre el prompt del LLM y la plantilla de respaldo, para que el
// usuario reciba el mismo texto de precio sin importar que motor respondió.
export function formatPrice(precioMensual: number | null): string {
  if (precioMensual === null) {
    return "precio a confirmar con un asesor";
  }
  return `$${precioMensual.toLocaleString("es-CO")}/mes`;
}

export function formatPlanLine(plan: Plan): string {
  return `${plan.nombre}: ${formatPrice(plan.precio_mensual)}`;
}
