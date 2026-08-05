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
`networkStatus.service.ts`) y se lo pasa como "CONTEXTO" a Gemini
(`src/services/ai/`), con instrucciones estrictas de no inventar información
fuera de ese contexto (`promptBuilder.ts`).

- `GEMINI_API_KEY` / `GEMINI_MODEL` en `.env` (modelo por defecto:
  `gemini-2.0-flash`).
- Si la API key no está configurada, la llamada falla o hace timeout
  (10s), el sistema degrada automáticamente a una respuesta generada por
  plantilla determinística (`src/services/replyComposer.ts`) construida
  sobre el mismo contexto — el chat nunca se rompe por una falla del
  proveedor de IA.
- La respuesta de `/api/chat` incluye `"source": "gemini" | "fallback_template"`
  para que el frontend (y QA) pueda distinguir cuál generó la respuesta.

**Validado:** se probó con una API key real de Gemini; la autenticación
fue exitosa (no hubo error 401/403), pero la cuenta devolvió
`429 RESOURCE_EXHAUSTED` (sin créditos/facturación activa en AI Studio). El
fallback respondió correctamente ante ese error real, confirmando que el
mecanismo de resiliencia funciona en producción, no solo en teoría.

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
