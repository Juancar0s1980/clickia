import { Message } from "../models/message.model";
import { topicGuardService } from "./topicGuard.service";

function userMsg(message: string): Message {
  return { id: "m", conversation_id: "c", sender: "user", message, timestamp: new Date() };
}

function aiMsg(message: string): Message {
  return { id: "m", conversation_id: "c", sender: "ai", message, timestamp: new Date() };
}

describe("topicGuardService.isOnTopic", () => {
  it.each([
    "No tengo internet en ningún dispositivo",
    "Mi wifi está muy lento",
    "¿Cuánto cuesta el plan de 300 megas con TV?",
    "Quiero cambiar mi contraseña",
    "Necesito crear un ticket de soporte",
    "Se me dañó el router",
  ])("reconoce mensajes dentro del dominio de soporte del ISP: %s", (message) => {
    expect(topicGuardService.isOnTopic(message)).toBe(true);
  });

  it.each(["hola", "buenas tardes", "muchas gracias", "vale, listo", "sí"])(
    "deja pasar saludos/agradecimientos aunque no traigan vocabulario del dominio: %s",
    (message) => {
      expect(topicGuardService.isOnTopic(message)).toBe(true);
    },
  );

  it.each(["cuéntame un chiste", "¿cuál es la capital de Francia?", "ayúdame con mi tarea de matemáticas"])(
    "bloquea mensajes claramente fuera de tema sin historial previo: %s",
    (message) => {
      expect(topicGuardService.isOnTopic(message)).toBe(false);
    },
  );

  it("un seguimiento sin vocabulario propio hereda el tema si la conversación ya era de soporte", () => {
    const history = [userMsg("No tengo internet en ningún dispositivo"), aiMsg("Pasos recomendados...")];
    expect(topicGuardService.isOnTopic("Ya intenté eso y sigue sin funcionar", history)).toBe(true);
  });

  it("un mensaje fuera de tema no se rescata por un historial que también estaba fuera de tema", () => {
    const history = [userMsg("cuéntame un chiste"), aiMsg("off-topic reply")];
    expect(topicGuardService.isOnTopic("¿y uno más?", history)).toBe(false);
  });
});
