import { planRepository } from "../repositories/plan.repository";
import { Message } from "../models/message.model";
import { Plan } from "../models/plan.model";
import { tokenize } from "../utils/text";

// Mismo criterio de tokenizacion por palabra completa que knowledgeBase.service, para
// decidir si un mensaje del chat esta preguntando por planes/precios y, de ser asi,
// darle al LLM (o a la plantilla de respaldo) los precios reales en vez de dejarlo
// adivinar.
const PLAN_KEYWORDS = new Set([
  "plan", "planes", "precio", "precios", "tarifa", "tarifas", "costo", "costos",
  "vale", "cuesta", "cuanto", "combo", "combos", "triple", "mensualidad", "mejorar",
  "cambiar", "ampliar", "contratar", "internet", "megas", "mb", "canales", "movil",
  "moviles",
]);

function looksLikePlanQuery(userMessage: string): boolean {
  return tokenize(userMessage).some((t) => PLAN_KEYWORDS.has(t));
}

export const planService = {
  async listAll(): Promise<Plan[]> {
    return planRepository.findAllActive();
  },

  // Devuelve el catalogo completo cuando el mensaje (o la conversacion en curso) parece
  // preguntar por planes o precios; en cualquier otro caso devuelve null para no inflar
  // el contexto del LLM. Se incluyen los mensajes previos del usuario para que un
  // seguimiento como "¿y el de 300 megas?" siga reconociéndose como parte del mismo tema.
  async findRelevantPlans(userMessage: string, history: Message[] = []): Promise<Plan[] | null> {
    const priorUserText = history
      .filter((m) => m.sender === "user")
      .map((m) => m.message)
      .join(" ");

    if (!looksLikePlanQuery(`${priorUserText} ${userMessage}`)) {
      return null;
    }
    const plans = await planRepository.findAllActive();
    return plans.length > 0 ? plans : null;
  },
};
