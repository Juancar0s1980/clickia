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

## Estado del motor de diagnóstico

`POST /chat` ya ejecuta el flujo completo (clasifica el problema contra
`technical_problems`, consulta `solutions`, consulta el estado de red de la
zona) y compone la respuesta con una plantilla determinística
(`src/services/replyComposer.ts`). La Fase 4 reemplaza esa plantilla por una
llamada a un LLM (Gemini) usando el mismo contexto recuperado — el resto del
sistema no cambia.

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
