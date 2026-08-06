import { KnowledgeMatch } from "./knowledgeBase.service";
import { IspInfo } from "./ipLookup.service";
import { NetworkStatus } from "./networkStatus.service";
import { WeatherSnapshot } from "./weather.service";
import { Message } from "../models/message.model";
import { Plan } from "../models/plan.model";
import { formatPlanLine } from "./plan.format";

const STATUS_LABEL: Record<NetworkStatus["status"], string> = {
  operativo: "el servicio está operativo en tu zona",
  mantenimiento: "hay mantenimiento programado en tu zona",
  falla: "se reportó una falla del servicio en tu zona",
};

const TICKET_NUDGE =
  'Lo mejor en este punto es crear un ticket de soporte para que un técnico lo revise directamente: usa el botón "¿No se resolvió? Crear ticket de soporte".';

function buildPlansBlock(plans: Plan[]): string {
  const lines = plans.map((p) => `- ${formatPlanLine(p)}`);
  return `Estos son nuestros planes disponibles:\n${lines.join("\n")}\n\nPuedes ver el detalle completo en la sección "Planes". Si quieres cambiarte, crea un ticket de soporte y un asesor comercial te contacta para confirmar disponibilidad.`;
}

function alreadyGaveStepsFor(history: Message[], problemNombre: string): boolean {
  return history.some((m) => m.sender === "ai" && m.message.includes(`"${problemNombre}"`) && m.message.includes("Pasos recomendados"));
}

function hadAnyPriorDiagnostic(history: Message[]): boolean {
  return history.some((m) => m.sender === "ai" && m.message.includes("Pasos recomendados"));
}

// Compone la respuesta a partir del contexto recuperado (problema + soluciones + estado de red +
// planes + historial de la conversacion), sin inventar informacion. Fase 4 sustituye la parte
// tecnica de esta plantilla por una llamada al LLM con el mismo contexto; se conserva como
// respaldo si no hay proveedor configurado.
export function buildDiagnosticReply(
  match: KnowledgeMatch | null,
  networkStatus: NetworkStatus,
  plans: Plan[] | null = null,
  history: Message[] = [],
  weather: WeatherSnapshot | null = null,
  ispInfo: IspInfo | null = null,
): string {
  const statusLine =
    networkStatus.status === "operativo"
      ? null
      : `Antes que nada: ${STATUS_LABEL[networkStatus.status]}${
          networkStatus.estimated_time ? ` (tiempo estimado: ${networkStatus.estimated_time})` : ""
        }.`;

  // El clima severo (lluvia fuerte, tormenta) es una causa real de caidas de señal en un
  // ISP; se menciona junto al estado de red, no reemplaza el diagnostico tecnico.
  const weatherLine =
    weather?.isSevere && match
      ? `También noto que hay ${weather.description} en tu zona ahora mismo; esto puede estar afectando la señal.`
      : null;

  // Si la conexion actual del cliente no parece ser la de DobleClick (ej. escribe desde
  // datos moviles mientras reporta su internet de casa caido), es una pista real: desde el
  // servidor no se puede confirmar nada de esa otra red.
  const ispLine =
    ispInfo && match
      ? `Detecto que en este momento estás conectado a través de "${ispInfo.isp}". Si no corresponde a tu servicio de DobleClick, es posible que estés usando otra red (por ejemplo datos móviles) mientras reportas el problema.`
      : null;

  if (!match) {
    if (plans && plans.length > 0) {
      const parts = [buildPlansBlock(plans)];
      if (statusLine) parts.unshift(statusLine);
      return parts.join("\n\n");
    }

    // Ya se le dieron pasos antes en esta conversación y el mensaje actual no aporta señales
    // nuevas (ej. "sigue sin funcionar"): en vez de pedir más detalle otra vez, se asume que
    // los pasos no resolvieron el problema y se ofrece el ticket directamente.
    if (hadAnyPriorDiagnostic(history)) {
      const parts = [
        "Entiendo que los pasos anteriores no resolvieron el problema.",
        TICKET_NUDGE,
      ];
      if (statusLine) parts.unshift(statusLine);
      return parts.join(" ");
    }

    const parts = [
      "No logré identificar con certeza tu problema a partir del mensaje.",
      "¿Podrías darme más detalle? Por ejemplo: ¿no tienes internet en ningún dispositivo, la conexión es lenta, o el router muestra alguna luz en particular?",
    ];
    if (statusLine) parts.unshift(statusLine);
    return parts.join(" ");
  }

  // Mismo problema ya diagnosticado antes en esta conversación: repetir los mismos pasos no
  // ayuda, así que se reconoce que no funcionaron y se ofrece escalar a un ticket.
  if (alreadyGaveStepsFor(history, match.problem.nombre)) {
    const parts = [`Veo que ya te compartí los pasos para "${match.problem.nombre}" y el problema sigue presente.`, TICKET_NUDGE];
    if (ispLine) parts.unshift(ispLine);
    if (weatherLine) parts.unshift(weatherLine);
    if (statusLine) parts.unshift(statusLine);
    if (plans && plans.length > 0) parts.push(buildPlansBlock(plans));
    return parts.join("\n\n");
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
  if (weatherLine) parts.push(weatherLine);
  if (ispLine) parts.push(ispLine);
  if (stepsText) parts.push(`Pasos recomendados:\n${stepsText}`);
  if (recomendaciones.length > 0) parts.push(recomendaciones.join(" "));
  if (plans && plans.length > 0) parts.push(buildPlansBlock(plans));

  return parts.join("\n\n");
}
