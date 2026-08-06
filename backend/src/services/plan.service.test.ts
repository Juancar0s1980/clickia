import { planRepository } from "../repositories/plan.repository";
import { Message } from "../models/message.model";
import { Plan } from "../models/plan.model";
import { planService } from "./plan.service";

jest.mock("../repositories/plan.repository");

const mockedFindAllActive = planRepository.findAllActive as jest.MockedFunction<
  typeof planRepository.findAllActive
>;

const PLANS: Plan[] = [
  {
    id: "plan-1",
    numero: 2,
    categoria: "doble",
    nombre: "Combo Internet 100 Mb + TV",
    velocidad_mb: 100,
    incluye_tv: true,
    tv_canales: null,
    moviles_gb: null,
    precio_mensual: 60000,
    nota: "nota",
    activo: true,
  },
];

beforeEach(() => {
  mockedFindAllActive.mockResolvedValue(PLANS);
});

describe("planService.findRelevantPlans", () => {
  it("devuelve el catalogo cuando el mensaje pregunta por precios/planes", async () => {
    const plans = await planService.findRelevantPlans("¿cuánto cuesta el plan de 300 megas?");
    expect(plans).toEqual(PLANS);
  });

  it("devuelve el catalogo para 'mejorar mi plan'", async () => {
    const plans = await planService.findRelevantPlans("Mejorar mi plan");
    expect(plans).toEqual(PLANS);
  });

  it("devuelve null para un mensaje sin relación (regresión: no debe activarse en cualquier mensaje)", async () => {
    const plans = await planService.findRelevantPlans("Se me cayó el router al piso y no enciende");
    expect(plans).toBeNull();
    expect(mockedFindAllActive).not.toHaveBeenCalled();
  });

  it("reconoce un seguimiento sin keywords propias ('¿y el de 300?') cuando el historial ya hablaba de planes", async () => {
    const history: Message[] = [
      { id: "m1", conversation_id: "c1", sender: "user", message: "¿cuáles son los planes de internet?", timestamp: new Date() },
      { id: "m2", conversation_id: "c1", sender: "ai", message: "Estos son nuestros planes disponibles...", timestamp: new Date() },
    ];
    const plans = await planService.findRelevantPlans("¿y el de 300?", history);
    expect(plans).toEqual(PLANS);
  });
});
