import { Message } from "../../models/message.model";
import { IspInfo } from "../ipLookup.service";
import { NetworkStatus } from "../networkStatus.service";
import { WeatherSnapshot } from "../weather.service";
import { buildUserPrompt } from "./promptBuilder";

const status: NetworkStatus = { zone: "Centro", service: "internet", status: "operativo", estimated_time: null };

function msg(sender: Message["sender"], message: string): Message {
  return { id: "m", conversation_id: "c", sender, message, timestamp: new Date() };
}

describe("buildUserPrompt", () => {
  it("no incluye bloque de historial cuando no hay mensajes previos", () => {
    const prompt = buildUserPrompt("hola", null, status);
    expect(prompt).not.toMatch(/HISTORIAL DE LA CONVERSACIÓN/);
  });

  it("incluye el historial con el remitente en español, en orden", () => {
    const history = [msg("user", "no tengo internet"), msg("ai", "¿en qué zona estás?")];
    const prompt = buildUserPrompt("en el centro", null, status, null, history);
    expect(prompt).toMatch(/HISTORIAL DE LA CONVERSACIÓN/);
    const historyIndex = prompt.indexOf("Usuario: no tengo internet");
    const aiIndex = prompt.indexOf("Asistente: ¿en qué zona estás?");
    expect(historyIndex).toBeGreaterThan(-1);
    expect(aiIndex).toBeGreaterThan(historyIndex);
  });

  it("recorta el historial a los últimos 10 mensajes para no crecer sin límite", () => {
    const history = Array.from({ length: 15 }, (_, i) => msg("user", `mensaje ${i}`));
    const prompt = buildUserPrompt("actual", null, status, null, history);
    expect(prompt).not.toMatch(/mensaje 4\b/);
    expect(prompt).toMatch(/mensaje 14/);
  });

  it("incluye el clima en el CONTEXTO cuando se entrega", () => {
    const weather: WeatherSnapshot = {
      zone: "Centro",
      temperatureC: 17,
      precipitationMm: 12,
      weatherCode: 95,
      description: "tormenta eléctrica",
      isSevere: true,
    };
    const prompt = buildUserPrompt("no tengo internet", null, status, null, [], weather);
    expect(prompt).toMatch(/Clima actual en la zona: tormenta eléctrica, 17°C, precipitación 12mm \(condición severa/);
  });

  it("no incluye clima cuando no se entrega", () => {
    const prompt = buildUserPrompt("no tengo internet", null, status);
    expect(prompt).not.toMatch(/Clima actual/);
  });

  it("incluye el proveedor/ISP detectado en el CONTEXTO cuando se entrega", () => {
    const ispInfo: IspInfo = { ip: "34.1.2.3", isp: "Claro Colombia", org: "Claro", asn: "AS3816", city: "Popayán" };
    const prompt = buildUserPrompt("no tengo internet", null, status, null, [], null, ispInfo);
    expect(prompt).toMatch(/Conexión actual detectada: proveedor "Claro Colombia" en Popayán/);
  });

  it("no incluye el proveedor/ISP cuando no se entrega", () => {
    const prompt = buildUserPrompt("no tengo internet", null, status);
    expect(prompt).not.toMatch(/Conexión actual detectada/);
  });
});
