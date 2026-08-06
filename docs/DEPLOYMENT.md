# Despliegue en Render (plan gratuito)

Plataforma elegida: **Render** — plan gratuito real y completo (web service +
static site + PostgreSQL gestionado) sin tarjeta de crédito ni Docker.
Verificado contra la documentación oficial de Render el 2026-08-06:

- Web Service gratis: 750 horas/mes, se duerme tras 15 min sin tráfico,
  tarda ~1 minuto en despertar en el siguiente request.
- Static Site: gratis, sin cold start.
- PostgreSQL gratis: expira 30 días después de creado (14 días de gracia
  para migrar), 1 GB, sin backups. Sobra para el proceso de revisión; si se
  necesita persistencia más allá de eso, migrar a un Postgres gestionado
  aparte (Neon/Supabase) reutilizando el mismo `DATABASE_URL`.
- **El plan gratuito no tiene acceso a Shell/SSH** — por eso el primer
  admin se crea automáticamente en el arranque (ver más abajo), no a mano
  por consola.

## 1. Base de datos (PostgreSQL)

1. Dashboard de Render → **New → PostgreSQL**.
2. Nombre: `clickia-db`. Cualquier región (anotarla, usarla también para el
   backend).
3. Plan **Free**. Crear.
4. Una vez lista, copiar la **Internal Database URL** (si el backend se crea
   en la misma región) o la **External Database URL** (si no).

## 2. Backend (Web Service)

1. Dashboard → **New → Web Service** → conectar el repo
   `Juancar0s1980/clickia`.
2. **Root Directory:** `backend` (es un monorepo).
3. **Environment:** Node.
4. **Build Command:** `npm install && npm run build`
5. **Start Command:**
   ```
   npm run migrate -- --seed && (if [ -n "$ADMIN_EMAIL" ]; then npm run create-admin; fi) && npm start
   ```
   La parte del `if` crea (o promueve) el admin automáticamente en cada
   arranque **solo si** `ADMIN_EMAIL`/`ADMIN_PASSWORD` están configuradas —
   es la forma de bootstrapear el primer admin sin Shell. El script ya es
   idempotente (si el correo ya es admin, no hace nada distinto).
6. Plan **Free**.
7. Variables de entorno (Environment → Add Environment Variable):

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | La URL copiada en el paso 1 |
   | `JWT_SECRET` | Generar con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` **en tu máquina** — nunca reutilices el de `.env` local ni lo pegues en el chat |
   | `JWT_EXPIRES_IN` | `15m` |
   | `REFRESH_TOKEN_EXPIRES_IN_DAYS` | `30` |
   | `CORS_ORIGIN` | (dejar cualquier valor por ahora, se actualiza en el paso 4) |
   | `GROQ_API_KEY` | Tu API key real de Groq |
   | `GROQ_MODEL` | `llama-3.3-70b-versatile` |
   | `AI_PROVIDER` | (vacío) |
   | `WEATHER_ENABLED` | `true` |
   | `IP_LOOKUP_ENABLED` | `true` |
   | `LOG_LEVEL` | `info` |
   | `RATE_LIMIT_WINDOW_MS` | `900000` |
   | `RATE_LIMIT_MAX` | `300` |
   | `AUTH_RATE_LIMIT_MAX` | `10` |
   | `AI_RATE_LIMIT_WINDOW_MS` | `300000` |
   | `AI_RATE_LIMIT_MAX` | `15` |
   | `ADMIN_EMAIL` | El correo que quieras para el admin inicial |
   | `ADMIN_PASSWORD` | Una contraseña real (mínimo 8 caracteres) |
   | `ADMIN_NOMBRE` | Ej. `Administrador DobleClick` |

   (`NODE_ENV=production` y `PORT` los define Render solo, no hace falta
   agregarlos.)

8. Crear el servicio y esperar el primer deploy. Confirmar que
   `https://<tu-servicio>.onrender.com/health` responde `{"status":"ok"}`.

## 3. Frontend (Static Site)

1. Dashboard → **New → Static Site** → mismo repo.
2. **Root Directory:** `frontend`.
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `dist`
5. Variable de entorno: `VITE_API_URL` = `https://<tu-backend>.onrender.com/api`
   (la URL del paso 2.8, con `/api` al final — Vite la incrusta en el build,
   así que debe estar configurada *antes* de crear el sitio).
6. **Redirect/Rewrite Rule** (pestaña "Redirects/Rewrites" del static site,
   crítico para que React Router funcione al recargar o entrar directo a
   una ruta como `/dashboard`):
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**
7. Crear el sitio. Copiar la URL pública que asigna Render.

## 4. Cerrar el círculo: CORS

1. Volver al Web Service del backend → **Environment**.
2. Editar `CORS_ORIGIN` con la URL exacta del static site del paso 3.7 (sin
   `/` final).
3. Guardar — Render redespliega el backend automáticamente.

## 5. Verificación final

- Abrir la URL del frontend, registrar un usuario (con el checkbox de
  consentimiento), iniciar sesión, hablar con el chat, ver que el clima/ISP
  aparecen en el diagnóstico, crear un ticket.
- Iniciar sesión con `ADMIN_EMAIL`/`ADMIN_PASSWORD` del paso 2.7, confirmar
  que entra como admin y puede ver usuarios/tickets/estado de red.
- Anotar en la entrega: *"El primer acceso puede tardar ~30-60s por el
  plan gratuito de Render (el backend se duerme tras 15 min sin uso)."*

## Crear admins adicionales más tarde

Como el plan gratuito no tiene Shell, para promover/crear otro admin más
adelante corre el script **localmente**, apuntando a la base de datos de
Render (usa la External Database URL del paso 1):

```bash
cd backend
NODE_ENV=production DATABASE_URL="<external-database-url>" \
  ADMIN_EMAIL=otro@correo.com ADMIN_PASSWORD=... ADMIN_NOMBRE="Otro Admin" \
  npm run create-admin
```

`NODE_ENV=production` es necesario aquí para que la conexión use TLS (ver
`backend/src/config/database.ts`).
