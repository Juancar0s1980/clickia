import { KnowledgeMatch } from "./knowledgeBase.service";
import { IspInfo } from "./ipLookup.service";
import { NetworkStatus } from "./networkStatus.service";
import { WeatherSnapshot } from "./weather.service";
import { Message } from "../models/message.model";
import { Plan } from "../models/plan.model";
import { buildDiagnosticReply } from "./replyComposer";

const operativo: NetworkStatus = { zone: "Centro", service: "internet", status: "operativo", estimated_time: null };
const enFalla: NetworkStatus = { zone: "Sur", service: "internet", status: "falla", estimated_time: "2 horas" };

const PLANS: Plan[] = [
  {
    id: "plan-1",
    numero: 6,
    categoria: "doble",
    nombre: "Combo Internet 300 Mb + TV",
    velocidad_mb: 300,
    incluye_tv: true,
    tv_canales: null,
    moviles_gb: null,
    precio_mensual: 100000,
    nota: "nota",
    activo: true,
  },
  {
    id: "plan-2",
    numero: 16,
    categoria: "triple",
    nombre: "Triple Internet 450 Mb + TV + Móvil 20 Gb",
    velocidad_mb: 450,
    incluye_tv: true,
    tv_canales: 90,
    moviles_gb: 20,
    precio_mensual: null,
    nota: "nota",
    activo: true,
  },
];

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

  it("lista los planes con precio real cuando el mensaje pregunta por planes y no hay problema técnico identificado", () => {
    const reply = buildDiagnosticReply(null, operativo, PLANS);
    expect(reply).toMatch(/Combo Internet 300 Mb \+ TV: \$100.000\/mes/);
    expect(reply).not.toMatch(/más detalle/i);
  });

  it("indica que el precio se confirma con un asesor cuando el plan no tiene precio cargado", () => {
    const reply = buildDiagnosticReply(null, operativo, PLANS);
    expect(reply).toMatch(/Triple Internet 450 Mb \+ TV \+ Móvil 20 Gb: precio a confirmar con un asesor/);
  });

  it("agrega los planes al final cuando ademas hay un problema tecnico identificado (ej. 'Mejorar mi plan')", () => {
    const reply = buildDiagnosticReply(match, operativo, PLANS);
    expect(reply).toMatch(/WiFi lento/);
    expect(reply).toMatch(/Combo Internet 300 Mb \+ TV: \$100.000\/mes/);
  });

  describe("memoria de la conversación", () => {
    const historyConPasosDados: Message[] = [
      { id: "m1", conversation_id: "c1", sender: "user", message: "mi wifi está lento", timestamp: new Date() },
      {
        id: "m2",
        conversation_id: "c1",
        sender: "ai",
        message: 'Vamos a diagnosticar: identifiqué que tu caso corresponde a "WiFi lento".\n\nPasos recomendados:\n1. Reinicie el router',
        timestamp: new Date(),
      },
    ];

    it("no repite los mismos pasos si ya se dieron antes para el mismo problema, y ofrece crear un ticket", () => {
      const reply = buildDiagnosticReply(match, operativo, null, historyConPasosDados);
      expect(reply).not.toMatch(/1\. Reinicie el router/);
      expect(reply).toMatch(/crear un ticket de soporte/i);
    });

    it("sin historial previo, sí da los pasos normalmente (regresión: no debe activarse en la primera vez)", () => {
      const reply = buildDiagnosticReply(match, operativo, null, []);
      expect(reply).toMatch(/1\. Reinicie el router/);
    });

    it("cuando no hay match pero ya se dio un diagnóstico antes, sugiere ticket en vez de pedir más detalle", () => {
      const reply = buildDiagnosticReply(null, operativo, null, historyConPasosDados);
      expect(reply).not.toMatch(/más detalle/i);
      expect(reply).toMatch(/crear un ticket de soporte/i);
    });
  });

  describe("clima como señal de diagnóstico", () => {
    const tormenta: WeatherSnapshot = {
      zone: "Centro",
      temperatureC: 17,
      precipitationMm: 12,
      weatherCode: 95,
      description: "tormenta eléctrica",
      isSevere: true,
    };
    const despejado: WeatherSnapshot = {
      zone: "Centro",
      temperatureC: 22,
      precipitationMm: 0,
      weatherCode: 0,
      description: "cielo despejado",
      isSevere: false,
    };

    it("menciona el clima severo como posible causa junto con los pasos técnicos", () => {
      const reply = buildDiagnosticReply(match, operativo, null, [], tormenta);
      expect(reply).toMatch(/tormenta eléctrica/);
      expect(reply).toMatch(/afectando la señal/i);
      expect(reply).toMatch(/1\. Reinicie el router/);
    });

    it("no menciona el clima cuando es normal (no severo)", () => {
      const reply = buildDiagnosticReply(match, operativo, null, [], despejado);
      expect(reply).not.toMatch(/cielo despejado/);
    });

    it("no menciona el clima si no hay ningún problema técnico identificado", () => {
      const reply = buildDiagnosticReply(null, operativo, null, [], tormenta);
      expect(reply).not.toMatch(/tormenta eléctrica/);
    });
  });

  describe("proveedor/ISP detectado como señal de diagnóstico", () => {
    const ispInfo: IspInfo = { ip: "34.1.2.3", isp: "Tigo Colombia", org: "Tigo", asn: "AS14080", city: "Bogotá" };

    it("menciona el proveedor detectado junto con los pasos técnicos", () => {
      const reply = buildDiagnosticReply(match, operativo, null, [], null, ispInfo);
      expect(reply).toMatch(/Tigo Colombia/);
      expect(reply).toMatch(/1\. Reinicie el router/);
    });

    it("no menciona el proveedor si no hay ningún problema técnico identificado", () => {
      const reply = buildDiagnosticReply(null, operativo, null, [], null, ispInfo);
      expect(reply).not.toMatch(/Tigo Colombia/);
    });
  });
});
