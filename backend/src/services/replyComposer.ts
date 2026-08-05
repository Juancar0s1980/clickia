import { KnowledgeMatch } from "./knowledgeBase.service";
import { NetworkStatus } from "./networkStatus.service";

const STATUS_LABEL: Record<NetworkStatus["status"], string> = {
  operativo: "el servicio está operativo en tu zona",
  mantenimiento: "hay mantenimiento programado en tu zona",
  falla: "se reportó una falla del servicio en tu zona",
};

// Compone la respuesta a partir del contexto recuperado (problema + soluciones + estado de red),
// sin inventar informacion. Fase 4 sustituye esta plantilla por una llamada al LLM con el mismo contexto.
export function buildDiagnosticReply(match: KnowledgeMatch | null, networkStatus: NetworkStatus): string {
  const statusLine =
    networkStatus.status === "operativo"
      ? null
      : `Antes que nada: ${STATUS_LABEL[networkStatus.status]}${
          networkStatus.estimated_time ? ` (tiempo estimado: ${networkStatus.estimated_time})` : ""
        }.`;

  if (!match) {
    const parts = [
      "No logré identificar con certeza tu problema a partir del mensaje.",
      "¿Podrías darme más detalle? Por ejemplo: ¿no tienes internet en ningún dispositivo, la conexión es lenta, o el router muestra alguna luz en particular?",
    ];
    if (statusLine) parts.unshift(statusLine);
    return parts.join(" ");
  }

  const steps = match.solutions.flatMap((s) => s.pasos);
  const stepsText = steps.map((step, i) => `${i + 1}. ${step}`).join("\n");
  const recomendaciones = match.solutions
    .map((s) => s.recomendacion)
    .filter((r): r is string => Boolean(r));

  const parts = [
    `Vamos a diagnosticar: identifiqué que tu caso corresponde a "${match.problem.nombre}".`,
  ];
  if (statusLine) parts.push(statusLine);
  if (stepsText) parts.push(`Pasos recomendados:\n${stepsText}`);
  if (recomendaciones.length > 0) parts.push(recomendaciones.join(" "));

  return parts.join("\n\n");
}
