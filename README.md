# ClickIA

**Asistente inteligente de soporte técnico para proveedores de Internet.**

ClickIA ayuda a los usuarios de un ISP a resolver problemas comunes de
conectividad (sin internet, wifi lento, router con luces de error, etc.)
mediante un chat con IA que combina una base de conocimiento propia (RAG) con
el estado real del servicio, y escala a un ticket humano cuando no puede
resolver el caso.

## Estado del proyecto

En construcción por fases. Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
para la arquitectura completa y el detalle de cada fase.

- [x] Fase 1 — Arquitectura y diseño
- [x] Fase 2 — Base de datos
- [x] Fase 3 — Backend
- [x] Fase 4 — Integración IA
- [ ] Fase 5 — Frontend
- [ ] Fase 6 — Seguridad
- [ ] Fase 7 — Testing
- [ ] Fase 8 — Docker y despliegue

## Stack

React + Vite + TypeScript · Node.js + Express + TypeScript · PostgreSQL ·
Gemini API (RAG) · Docker.

## Estructura

```
backend/    API REST por capas (controllers, services, repositories)
frontend/   SPA de chat (React)
docker/     Configuración de contenedores
docs/       Documentación técnica
```

## Instalación

Ver [backend/README.md](backend/README.md) para instalar y ejecutar la API.
El frontend se documentará en la Fase 5 y Docker en la Fase 8.
