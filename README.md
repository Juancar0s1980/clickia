# ClickIA

**Asistente inteligente de soporte técnico para DobleClick (ISP, Popayán y Timbío, Cauca).**

## Definición del proyecto

| | |
|---|---|
| **Nombre** | ClickIA |
| **Finalidad del chatbot** | Soporte técnico y de cuenta para los clientes del ISP DobleClick: diagnosticar fallas de conectividad, resolver dudas de plan/precio, y escalar a un ticket humano cuando no puede resolver el caso. |
| **Problema que resuelve** | Reducir la carga de soporte de primer nivel (fallas repetitivas: "no tengo internet", "wifi lento", contraseña olvidada) con un diagnóstico guiado paso a paso, disponible 24/7, sin esperar a un agente humano para lo resoluble. |
| **Tipo de usuario** | Clientes residenciales de DobleClick en Popayán y Timbío (rol `user`); personal de soporte de DobleClick (rol `admin`) que gestiona usuarios, estado de red y tickets. |
| **Valor de la IA** | El LLM no improvisa: recibe como contexto (RAG) la base de conocimiento técnico propia, el estado real del servicio en la zona, el clima, el proveedor de red detectado y el historial de la conversación, y compone una respuesta guiada — nunca inventa causas, pasos ni precios fuera de ese contexto. |
| **Utilidad de la segunda y tercera API** | Ver [sección de APIs externas](#apis-externas) — ambas están **integradas al flujo del diagnóstico**, no son llamadas aisladas. |

## Qué hace

- Un cliente se registra (con consentimiento explícito de almacenamiento de datos), habla con el chatbot sobre un problema técnico o de cuenta, y recibe un diagnóstico guiado paso a paso que usa su zona, el clima y el proveedor de red detectado.
- Si el chat no resuelve el problema, el cliente lo escala a un ticket; el equipo de soporte (admin) lo atiende y responde desde su propio panel, y el cliente ve la respuesta.
- Un administrador registra clientes (uno a uno o por CSV), gestiona el estado de red por zona, ve estadísticas de fallas recurrentes, y consulta cualquier conversación registrada.

## APIs externas

ClickIA integra **tres** APIs además de la base de datos, todas en el flujo principal del chat (no llamadas sueltas):

1. **Modelo de lenguaje** — Groq o Gemini (intercambiables vía `AI_PROVIDER`, ver [backend/README.md](backend/README.md)). Genera la respuesta del chat a partir del contexto recuperado (RAG).
2. **Open-Meteo** (clima, sin API key) — lluvia fuerte o tormenta en la zona del cliente es una causa real de caídas de señal en un ISP; el clima detectado se usa como señal de diagnóstico y se persiste junto al resto del caso.
3. **ip-api.com** (proveedor/ISP del cliente según su IP, sin API key) — identifica desde qué red está conectado el cliente en el momento de reportar el problema (por ejemplo, datos móviles mientras su servicio fijo está caído), como pista adicional de diagnóstico. Nunca se usa para dar soporte sobre la red de otro proveedor — el alcance del chat es exclusivamente DobleClick.

Ambas (clima e ISP) se consultan solo cuando hay un problema técnico real identificado (no en preguntas de plan/cuenta), se degradan sin romper el chat si fallan o no están disponibles, y sus resultados se **guardan en la base de datos** (tabla `diagnostics`), no solo se usan para la respuesta y se descartan.

## Estado del proyecto

- [x] Registro/login de personas, con consentimiento de almacenamiento de datos
- [x] Chat con IA (Groq/Gemini intercambiables), memoria de conversación, y filtro de temas fuera de propósito
- [x] Segunda y tercera API (clima + proveedor/ISP) integradas al diagnóstico y persistidas en BD
- [x] Base de datos PostgreSQL (usuarios, conversaciones, mensajes, tickets, planes, diagnósticos, estado de red)
- [x] Panel de consulta (personas, conversaciones, detalle de mensajes) para administradores
- [x] Gestión de tickets (cliente escala, admin responde y cambia estado)
- [x] Seguridad: JWT + refresh tokens, rate limiting, AI Guard (anti prompt-injection), validación de entrada, credenciales solo por variables de entorno
- [x] Tests automatizados (backend: Jest/Supertest sobre BD real; frontend: Vitest/RTL)
- [ ] Despliegue con URL pública (en curso)
- [ ] Propuesta de segundo proyecto de IA — ver [docs/PROPUESTA_PROYECTO_IA.md](docs/PROPUESTA_PROYECTO_IA.md)

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para la arquitectura completa.

## Stack

React + Vite + TypeScript + Tailwind · Node.js + Express + TypeScript ·
PostgreSQL · Groq / Gemini (LLM, intercambiable) · Open-Meteo · ip-api.com.

## Estructura

```
backend/    API REST por capas (controllers, services, repositories)
frontend/   SPA de chat (React)
docs/       Documentación técnica y propuesta de proyecto adicional
```

## Instalación y ejecución

Ver [backend/README.md](backend/README.md) para instalar y ejecutar la API,
y [frontend/README.md](frontend/README.md) para la SPA.
