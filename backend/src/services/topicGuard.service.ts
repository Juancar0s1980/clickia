import { Message } from "../models/message.model";
import { tokenize } from "../utils/text";

// Vocabulario del dominio de soporte de un ISP (conectividad, TV, planes/comercial,
// cuenta). Se usa para decidir SIN llamar al LLM si un mensaje esta dentro de tema,
// asi las consultas fuera de tema no gastan tokens del proveedor de IA.
const ON_TOPIC_KEYWORDS = new Set([
  // conectividad
  "internet", "wifi", "router", "modem", "senal", "conexion", "conectar", "conectado",
  "desconectado", "desconexion", "lento", "lenta", "lentitud", "velocidad", "cae", "cayo",
  "intermitente", "luz", "luces", "cable", "cables", "red", "navegar", "ping", "streaming",
  // television
  "television", "tv", "canal", "canales", "decodificador", "antena",
  // comercial / planes
  "plan", "planes", "precio", "precios", "tarifa", "tarifas", "costo", "costos",
  "mensualidad", "factura", "facturas", "pago", "pagar", "deuda", "mora", "contratar",
  "cambiar", "mejorar", "ampliar", "combo", "combos", "triple", "megas", "mb", "gb",
  "datos", "movil", "moviles",
  // cuenta / soporte
  "cuenta", "contrasena", "clave", "usuario", "ticket", "tickets", "soporte", "tecnico",
  "reclamo", "queja", "servicio", "zona", "instalacion", "cita", "visita", "averia",
  "falla", "fallas", "fallo", "danado", "danada", "malo", "mala", "reparar", "reparacion",
  "dobleclick",
]);

// Saludos/agradecimientos sin contenido propio: se dejan pasar (el bot puede responder
// con naturalidad) sin que cuenten como "fuera de tema".
const GREETING_WORDS = new Set([
  "hola", "buenas", "buenos", "buen", "dias", "tardes", "noches", "hey", "hi", "hello",
  "que", "tal", "gracias", "muchas", "ok", "vale", "dale", "listo", "perfecto", "adios",
  "chao", "hasta", "luego", "si", "no",
]);

function isGreetingOnly(message: string): boolean {
  const tokens = tokenize(message, 1);
  return tokens.length > 0 && tokens.every((t) => GREETING_WORDS.has(t));
}

function isOnTopicMessage(message: string): boolean {
  return isGreetingOnly(message) || tokenize(message, 2).some((t) => ON_TOPIC_KEYWORDS.has(t));
}

export const OFF_TOPIC_REPLY =
  "Gracias por escribirnos. Solo puedo ayudarte con temas de tu servicio con DobleClick: fallas de conexión o TV, tu plan y precios, o tu cuenta. Para otras consultas te recomiendo buscar ayuda en otro lugar. ¿Hay algo relacionado con tu servicio en lo que te pueda ayudar?";

export const topicGuardService = {
  // Se evalua ANTES de tocar la base de conocimiento o el LLM. Un mensaje esta dentro de
  // tema si trae vocabulario del dominio (o es un saludo), o si la conversacion ya venia
  // siendo de soporte: un seguimiento como "ya lo intenté y sigue sin funcionar" no repite
  // palabras clave por si solo, pero hereda el tema del mensaje anterior del usuario.
  isOnTopic(userMessage: string, history: Message[] = []): boolean {
    if (isOnTopicMessage(userMessage)) {
      return true;
    }
    return history.some((m) => m.sender === "user" && isOnTopicMessage(m.message));
  },
};
