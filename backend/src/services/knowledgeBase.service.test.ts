import { solutionRepository } from "../repositories/solution.repository";
import { technicalProblemRepository } from "../repositories/technicalProblem.repository";
import { Message } from "../models/message.model";
import { TechnicalProblem } from "../models/technicalProblem.model";
import { knowledgeBaseService } from "./knowledgeBase.service";

jest.mock("../repositories/technicalProblem.repository");
jest.mock("../repositories/solution.repository");

const mockedFindAll = technicalProblemRepository.findAll as jest.MockedFunction<
  typeof technicalProblemRepository.findAll
>;
const mockedFindByProblemId = solutionRepository.findByProblemId as jest.MockedFunction<
  typeof solutionRepository.findByProblemId
>;

const PROBLEMS: TechnicalProblem[] = [
  {
    id: "p-router",
    nombre: "Router con luz roja",
    categoria: "hardware",
    descripcion: "El router muestra una luz indicadora en rojo o parpadeante.",
    nivel: "alto",
  },
  {
    id: "p-wifi",
    nombre: "WiFi lento",
    categoria: "rendimiento",
    descripcion: "La velocidad de la red inalámbrica es notablemente baja.",
    nivel: "medio",
  },
];

beforeEach(() => {
  mockedFindAll.mockResolvedValue(PROBLEMS);
  mockedFindByProblemId.mockResolvedValue([]);
});

describe("knowledgeBaseService.findRelevantProblem", () => {
  it("encuentra el problema cuyo nombre/categoria/descripcion comparte palabras con el mensaje", async () => {
    const match = await knowledgeBaseService.findRelevantProblem("mi router tiene una luz roja encendida");
    expect(match?.problem.id).toBe("p-router");
  });

  it("no devuelve match para un mensaje generico sin relación (regresión: 'una' no debe matchear por substring)", async () => {
    // "una" es substring literal de la descripcion de "Router con luz roja" ("muestra una luz...").
    // Con matching por substring esto daba un falso positivo (bug encontrado en Fase 4).
    const match = await knowledgeBaseService.findRelevantProblem("buenas, tengo una duda");
    expect(match).toBeNull();
  });

  it("devuelve null si el mensaje esta vacio o son solo signos de puntuación", async () => {
    expect(await knowledgeBaseService.findRelevantProblem("   ")).toBeNull();
    expect(await knowledgeBaseService.findRelevantProblem("¿?¡!")).toBeNull();
  });

  it("elige el problema con mayor puntaje cuando hay varias coincidencias parciales", async () => {
    const match = await knowledgeBaseService.findRelevantProblem("wifi lento y con mala velocidad");
    expect(match?.problem.id).toBe("p-wifi");
  });

  it("mantiene el hilo del diagnóstico usando el historial cuando el mensaje de seguimiento no trae señales propias", async () => {
    const history: Message[] = [
      { id: "m1", conversation_id: "c1", sender: "user", message: "mi router tiene una luz roja", timestamp: new Date() },
      { id: "m2", conversation_id: "c1", sender: "ai", message: "Pasos recomendados...", timestamp: new Date() },
    ];
    const match = await knowledgeBaseService.findRelevantProblem("sigue sin funcionar", history);
    expect(match?.problem.id).toBe("p-router");
  });

  it("sin historial relevante, un mensaje de seguimiento ambiguo sigue sin dar match (no inventa un problema)", async () => {
    const match = await knowledgeBaseService.findRelevantProblem("sigue sin funcionar");
    expect(match).toBeNull();
  });
});
