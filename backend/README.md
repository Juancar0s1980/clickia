# ClickIA — Backend

API REST en Node.js + Express + TypeScript, organizada por capas
(`controller → service → repository → PostgreSQL`). Ver
[../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) para el diseño completo.

## Instalación

```bash
cd backend
npm install
cp .env.example .env   # ajustar DATABASE_URL, JWT_SECRET, etc.
```

## Base de datos

```bash
npm run migrate         # aplica backend/src/database/migrations/*.sql
npm run seed             # aplica migraciones + seeds (base de conocimiento)
```

El runner (`src/database/migrate.ts`) es idempotente: registra cada archivo
aplicado en `schema_migrations` y no lo vuelve a ejecutar.

## Ejecución

```bash
npm run dev      # tsx watch, recarga en caliente
npm run build    # compila a dist/
npm start        # ejecuta dist/server.js
```

Health check: `GET /health`.

## Endpoints implementados (Fase 3)

Todos bajo el prefijo `/api`.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/users` | No | Registro de usuario |
| POST | `/api/auth/login` | No | Login, devuelve access + refresh token |
| POST | `/api/auth/refresh` | No | Rota el refresh token y emite uno nuevo |
| POST | `/api/auth/logout` | No | Revoca el refresh token |
| GET | `/api/conversations` | Sí | Lista conversaciones del usuario autenticado |
| GET | `/api/conversations/:id` | Sí | Conversación + mensajes |
| POST | `/api/chat` | Sí | Envía un mensaje y ejecuta el flujo de diagnóstico |
| POST | `/api/tickets` | Sí | Crea un ticket (escala la conversación si aplica) |
| GET | `/api/tickets` | Sí | Lista tickets del usuario |
| GET | `/api/network/status?zone=` | No | API ISP simulada |

Auth: header `Authorization: Bearer <accessToken>`.

## Integración de IA (Fase 4)

`POST /chat` implementa RAG: recupera contexto de `technical_problems` +
`solutions` + estado de red (`src/services/knowledgeBase.service.ts`,
`networkStatus.service.ts`) y se lo pasa como "CONTEXTO" a un LLM
(`src/services/ai/`), con instrucciones estrictas de no inventar información
fuera de ese contexto (`promptBuilder.ts`).

**Proveedor intercambiable:** `src/services/ai/types.ts` define la interfaz
`AiProvider`; `gemini.client.ts` y `groq.client.ts` la implementan. El
sistema no depende de un proveedor concreto (tal como establece la Fase 1 en
[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)):

- `AI_PROVIDER=groq|gemini` fuerza el proveedor. Vacío = autodetección
  (usa el primero con API key configurada; Groq antes que Gemini).
- `GROQ_API_KEY` / `GROQ_MODEL` (por defecto `llama-3.3-70b-versatile`).
- `GEMINI_API_KEY` / `GEMINI_MODEL` (por defecto `gemini-2.0-flash`).
- Si ningún proveedor está configurado, la llamada falla o hace timeout
  (10s), el sistema degrada automáticamente a una respuesta generada por
  plantilla determinística (`src/services/replyComposer.ts`) construida
  sobre el mismo contexto — el chat nunca se rompe por una falla del
  proveedor de IA.
- La respuesta de `/api/chat` incluye `"source"` (`"groq"`, `"gemini"` o
  `"fallback_template"`) para que el frontend (y QA) sepan qué la generó.

**Validado con ambos proveedores:**
- Gemini: API key real, autenticación exitosa, pero la cuenta devolvió
  `429 RESOURCE_EXHAUSTED` (sin créditos en AI Studio) → activó el fallback
  correctamente.
- Groq: API key real, generó respuestas coherentes usando el contexto (zona
  con falla + pasos de la base de conocimiento) sin inventar información, y
  pidió más detalle ante un mensaje ambiguo en vez de adivinar un problema.

**Bug encontrado y corregido durante la prueba con Groq:** el matcher de
`knowledgeBase.service.ts` usaba `string.includes()` (coincidencia por
substring), así que un mensaje genérico como "tengo una duda" matcheaba por
error con "Router con luz roja" porque el token "una" es substring literal
de su descripción ("muestra **una** luz..."). Se corrigió a comparación por
palabra completa (`Set` de tokens) más una lista de stopwords en español, y
se reverificó que los casos reales (wifi lento, router con luz roja) siguen
matcheando correctamente.

## Pruebas manuales (sin backend de test aún, ver Fase 7)

```bash
curl -X POST localhost:4000/api/users -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","email":"juan@example.com","password":"clave12345"}'

curl -X POST localhost:4000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"clave12345"}'

curl -X POST localhost:4000/api/chat -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"message":"No tengo internet","zone":"Centro"}'
```
