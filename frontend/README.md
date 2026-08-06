# ClickIA — Frontend

SPA en React + Vite + TypeScript + Tailwind CSS, conectada a la API del
backend. Ver [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) para el
diseño completo.

## Instalación

```bash
cd frontend
npm install
cp .env.example .env   # ajustar VITE_API_URL si el backend no corre en :4000
npm run dev
```

Requiere el backend corriendo (ver [../backend/README.md](../backend/README.md)).

## Estructura

```
src/
├── components/
│   ├── ui/        Button, Input, Card, Spinner, ErrorBanner, Logo (reutilizables)
│   ├── chat/       ChatBubble, ChatInput, QuickActionButton, DiagnosticSteps,
│   │               CreateTicketPanel, TicketCreatedCard, ConversationSidebar
│   └── layout/     AppShell (header + nav), ProtectedRoute
├── pages/          Login, Register, ForgotPassword, Dashboard, Chat, NotFound
├── context/        AuthContext (sesión persistida en localStorage)
├── hooks/          React Query por recurso (conversations, chat, tickets, network)
├── services/       Cliente Axios + API por dominio (auth, chat, conversations, tickets, network)
└── types/          Tipos compartidos con el backend (api.ts)
```

## Pantallas implementadas (Fase 5)

- **Login / Registro**: formularios validados con `react-hook-form` + `zod`,
  estados de carga y error. "Recuperar contraseña" es un stub honesto (el
  backend no expone ese endpoint todavía).
- **Dashboard**: badge de estado del servicio por zona, lista de
  conversaciones recientes, acceso a nueva consulta.
- **Chat**: historial en el panel izquierdo, burbujas de conversación,
  botones rápidos ("No tengo internet", "WiFi lento", "Router con luz roja"),
  panel de **diagnóstico visual** (checklist ✓/○ + badge de estado de red)
  después de cada respuesta, y flujo para escalar a ticket sin salir del chat.
- **Ticket creado**: número, estado y prioridad, inline en la conversación.
- **Admin** (protegido por `AdminRoute`, solo si `user.role === "admin"`):
  para este rol, "Panel" deja de mostrar el dashboard de cliente y se
  convierte en un panel de estadísticas (`AdminStatsPage`) — totales de
  usuarios/conversaciones/tickets y una gráfica de barras simple (sin
  librerías externas) con las fallas más recurrentes detectadas en el chat.
  "Usuarios" permite registrar clientes con su tipo de servicio
  (Internet/WiFi, TV, o ambos — un `<select>` estándar, no doble-click),
  listarlos y ver las conversaciones de cualquiera. "Estado de red" actualiza
  el estado por zona que consume el chat. El admin no tiene acceso al chat de
  soporte (no es cliente del ISP): el link se oculta y `/chat` redirige a
  `/dashboard` si se navega ahí directo.

## Pantallas agregadas después de la Fase 5

- **Registro**: además de nombre/correo/contraseña/teléfono, incluye el
  checkbox obligatorio de **consentimiento de almacenamiento de datos**
  (bloquea el envío si no se acepta) y un botón de ojo para mostrar/ocultar
  la contraseña (`Input.tsx`, aplica a cualquier campo `type="password"` de
  la app). La **dirección** ahora se pide explícitamente como "dirección de
  tu casa" (para que un técnico pueda ubicarte en una visita presencial) y
  se agregó un campo separado de **zona** (Centro/Norte/Sur/Occidente/
  Timbío, mismo catálogo de `constants/zones.ts`) para que el admin ubique
  rápido el sector sin leer la dirección completa; el admin también la
  captura al crear un cliente (`CreateUserForm`) y por CSV, y se ve como
  columna en la tabla de usuarios. La zona registrada se reutiliza como
  zona por defecto del chat/dashboard (`AuthContext` la siembra en
  `zoneStorage` al iniciar sesión), así no se vuelve a preguntar.
- **Panel del cliente**: rediseñado en dos columnas (saludo + estado del
  servicio/clima a la derecha) y con el historial de conversaciones como
  contenido principal, con badge de color por estado. "Mis tickets" se
  movió a su propia página.
- **Mis tickets** (`/tickets`, solo clientes): lista completa de los
  tickets propios con la respuesta del equipo de soporte cuando ya existe.
- **Planes** (`/planes`): catálogo de planes de DobleClick en tarjetas,
  con la misma paleta de marca; el chat también responde preguntas de
  precio con estos mismos datos.
- **Admin → Tickets**: tabla compacta + modal "Atender ticket" (como el de
  cambiar contraseña) para escribir una respuesta y cambiar el estado en un
  solo envío, en vez de una fila expandible dentro de la tabla.
- **Logo**: ícono de marca real (`assets/logo-icon.png`, con fondo
  transparente) en vez del cuadro con "C"; el texto "ClickIA" se mantiene
  como texto real (no parte de la imagen) para que sea legible en modo
  oscuro. Favicon del navegador también actualizado (`public/favicon.png`).

## Sesión y refresco de token

`services/httpClient.ts` adjunta el access token a cada request y, ante un
401, intenta refrescar una vez con el refresh token guardado antes de forzar
logout (evento `clickia:auth-logout` que `AuthContext` escucha).

## Validado en navegador real

Se probó el flujo completo (registro → login → dashboard → chat con
respuesta real de Groq → diagnóstico visual → crear ticket) con Playwright
contra el backend real (Postgres en Docker). Sin errores de consola.

Dos bugs de sincronización de estado se encontraron y corrigieron durante
esta prueba, ambos en `ChatPage.tsx`: el `useEffect` que sincroniza mensajes
desde `useConversation` se disparaba (a) al crear una conversación nueva y
(b) al invalidar `["conversations"]` tras crear un ticket — en ambos casos
pisaba con `null` el diagnóstico/ticket que se acababan de mostrar. Se
corrigió distinguiendo "cambio real de conversación" de "refetch de fondo de
la misma conversación" con una referencia (`lastSyncedConversationIdRef`).

## Tests automatizados (Fase 7)

Vitest + React Testing Library. Los hooks (`useConversations`, `useChat`,
`useTickets`) se mockean para probar el comportamiento de cada página sin
depender de red real ni de un `QueryClientProvider`.

```bash
npm test
```

- `LoginPage.test.tsx`: errores de validación, llamada a `login` con las
  credenciales correctas, error del servidor mostrado en pantalla.
- `ChatPage.test.tsx`: enviar un mensaje por botón rápido crea la
  conversación y muestra la respuesta de IA junto al panel de diagnóstico;
  crear un ticket desde ese diagnóstico muestra el número de ticket; un
  fallo al enviar el mensaje muestra el error sin romper el chat.
- `AdminUsersPage.test.tsx`: lista usuarios existentes y registra uno
  nuevo con su tipo de servicio.
- `AdminTicketsPage.test.tsx`: lista tickets con su estado y si ya tienen
  respuesta; el modal "Atender" envía la respuesta + el nuevo estado en un
  solo submit.

jsdom no implementa `Element.scrollIntoView` (lo usa `ChatPage` para
desplazar al último mensaje); se poliféna en `src/test/setup.ts`, junto con
el `cleanup()` de Testing Library entre tests.
