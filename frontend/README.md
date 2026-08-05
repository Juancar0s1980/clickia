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
