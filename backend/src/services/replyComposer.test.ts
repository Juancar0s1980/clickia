import { KnowledgeMatch } from "./knowledgeBase.service";
import { NetworkStatus } from "./networkStatus.service";
import { buildDiagnosticReply } from "./replyComposer";

const operativo: NetworkStatus = { zone: "Centro", service: "internet", status: "operativo", estimated_time: null };
const enFalla: NetworkStatus = { zone: "Sur", service: "internet", status: "falla", estimated_time: "2 horas" };

const match: KnowledgeMatch = {
  score: 2,
  problem: {
    id: "p1",
    nombre: "WiFi lento",
    categoria: "rendimiento",
    descripcion: "La velocidad de la red inalámbrica es notablemente baja.",
    nivel: "medio",
  },
  solutions: [
    {
      id: "s1",
      problem_id: "p1",
      titulo: "Mejorar velocidad",
      pasos: ["Reinicie el router", "Reduzca dispositivos conectados"],
      recomendacion: "Si persiste, puede haber saturación en la zona.",
    },
  ],
};

describe("buildDiagnosticReply", () => {
  it("pide más detalle cuando no hay problema identificado y el servicio esta operativo", () => {
    const reply = buildDiagnosticReply(null, operativo);
    expect(reply).toMatch(/más detalle/i);
    expect(reply).not.toMatch(/mantenimiento|falla/i);
  });

  it("menciona la falla del servicio antes de pedir mas detalle si no hay match", () => {
    const reply = buildDiagnosticReply(null, enFalla);
    expect(reply).toMatch(/falla del servicio/i);
    expect(reply).toMatch(/2 horas/);
  });

  it("lista los pasos numerados cuando hay un problema identificado", () => {
    const reply = buildDiagnosticReply(match, operativo);
    expect(reply).toMatch(/WiFi lento/);
    expect(reply).toMatch(/1\. Reinicie el router/);
    expect(reply).toMatch(/2\. Reduzca dispositivos conectados/);
    expect(reply).toMatch(/saturación en la zona/);
  });

  it("antepone el estado de red cuando hay problema identificado y el servicio no esta operativo", () => {
    const reply = buildDiagnosticReply(match, enFalla);
    const statusIndex = reply.indexOf("falla del servicio");
    const stepsIndex = reply.indexOf("1. Reinicie el router");
    expect(statusIndex).toBeGreaterThan(-1);
    expect(statusIndex).toBeLessThan(stepsIndex);
  });
});
