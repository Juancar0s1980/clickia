# Propuesta de proyecto adicional con IA

## Radar Predictivo DobleClick

Herramienta interna (no conversacional, no orientada al cliente final) para
que DobleClick anticipe fallas de red recurrentes y clientes en riesgo de
cancelar el servicio, **antes** de que llamen a soporte o se vayan a la
competencia.

> Se presenta como propuesta, sin desarrollarla — es intencionalmente
> distinta a ClickIA: mientras ClickIA es un chatbot conversacional
> orientado al cliente, esta es una herramienta predictiva orientada al
> equipo interno de operaciones.

## Descripción del problema

Hoy, DobleClick (y cualquier ISP de tamaño similar) se entera de que una
zona tiene una falla recurrente, o de que un cliente está a punto de
cancelar, **de forma reactiva**: cuando el cliente llama a quejarse o pide
la baja del servicio. Para entonces ya hubo varios días de mala experiencia
que pudieron evitarse. La información para anticiparlo ya existe —tickets
repetidos en la misma zona, cortes frecuentes, retrasos de pago, quejas por
el mismo motivo— pero está dispersa y nadie la analiza de forma proactiva
porque hacerlo a mano no escala.

## Personas, empresas o sectores afectados

- **Clientes de DobleClick** que sufren la misma falla varias veces antes
  de que alguien la note como patrón (no solo como tickets aislados).
- **El equipo técnico/operativo de DobleClick**, que hoy prioriza visitas
  por orden de llegada del ticket, no por impacto o urgencia real.
- **El área comercial**, que se entera de una cancelación cuando el
  cliente ya decidió irse, no cuando todavía se puede retener.
- Es un problema generalizable a cualquier ISP regional o cooperativa de
  servicios con recursos técnicos limitados para atender todas las zonas
  a la vez.

## Solución propuesta y papel de la IA

Un panel interno que analiza continuamente los datos operativos ya
generados por la operación diaria (tickets, diagnósticos del chat, estado
de red, facturación) y calcula dos cosas:

1. **Riesgo de falla por zona/nodo**: qué zonas acumulan tickets y
   diagnósticos "sin resolver" por encima de lo normal, para programar
   mantenimiento preventivo antes de que colapse.
2. **Riesgo de cancelación por cliente**: qué clientes combinan varias
   señales de insatisfacción (tickets repetidos por el mismo motivo,
   retrasos de pago, caída en el uso del servicio) y deberían recibir una
   llamada proactiva de retención.

El papel de la IA no es "responder" como en ClickIA, sino **clasificar y
priorizar**: un modelo de scoring (o un LLM usado para resumir/explicar el
motivo detrás del score, en lenguaje simple para el equipo no técnico) que
convierte datos crudos en una lista accionable ordenada por urgencia.

## Datos o fuentes de información necesarios

- Histórico de tickets y su resolución (ya existe en ClickIA: tabla
  `tickets`).
- Histórico de diagnósticos del chat por zona y por cliente (tabla
  `diagnostics` — problema detectado, estado de red, clima e ISP en el
  momento del reporte).
- Estado de red por zona a lo largo del tiempo (`network_status`,
  versionado en vez de solo el valor actual).
- Datos de facturación/pagos (fuera del alcance actual de ClickIA;
  requeriría integrarse con el sistema de facturación de DobleClick).
- Opcional: clima histórico de la zona (misma API de Open-Meteo, en modo
  histórico) para correlacionar fallas con temporada de lluvias.

## Componentes principales de la solución

1. **Pipeline de datos**: job programado que agrega tickets +
   diagnósticos + estado de red por zona/cliente en una tabla de métricas
   (no se calcula en vivo, para no afectar el rendimiento de la app
   principal).
2. **Modelo de scoring**: un modelo simple y explicable (ej. regresión
   logística o árboles de decisión con `scikit-learn`) antes que una caja
   negra — en operaciones reales, poder explicar *por qué* un cliente
   quedó en riesgo importa más que unas décimas de precisión extra.
3. **Capa de explicación con LLM**: dado el score y las variables que más
   pesaron, un LLM redacta una frase en lenguaje simple ("3 fallas de wifi
   sin resolver en 2 semanas + 1 ticket abierto hace 5 días") para que el
   equipo no tenga que interpretar números crudos.
4. **Panel interno** (web, reutilizando el mismo stack de ClickIA): lista
   priorizada de zonas y clientes en riesgo, con el motivo explicado y un
   botón para marcar la acción tomada.

## Tecnologías o recursos necesarios

- Backend/frontend: mismo stack que ClickIA (Node + Express, React) para
  reutilizar autenticación, diseño y la base de datos ya existente.
- `scikit-learn` o similar para el modelo de scoring (Python, como
  servicio aparte, o un modelo entrenado y exportado si se prefiere
  mantener todo en Node).
- El mismo proveedor de LLM que ClickIA (Groq/Gemini) para la capa de
  explicación en lenguaje natural.
- Un job scheduler (cron, o un worker separado) para el pipeline de datos.

## Etapas de desarrollo

1. Definir con el equipo operativo qué señales realmente les sirven para
   priorizar (evitar construir métricas que nadie va a usar).
2. Construir el pipeline de agregación de datos ya existentes (tickets,
   diagnósticos, red) — es el paso de más valor con menor riesgo, porque
   los datos ya se están generando.
3. Prototipo del modelo de scoring con datos históricos reales, validado
   por el equipo (¿las zonas que el modelo marca como "en riesgo"
   coinciden con lo que ya sabían de forma intuitiva?).
4. Capa de explicación en lenguaje natural sobre el score.
5. Panel interno mínimo (lista priorizada + acción tomada).
6. Iterar con uso real: ¿el equipo efectivamente actúa sobre las alertas?

## Forma de validar el funcionamiento

- **Validación técnica del modelo**: sobre datos históricos, medir si las
  zonas/clientes que el modelo marcó como "alto riesgo" en el pasado
  efectivamente tuvieron la falla mayor o cancelaron (backtesting simple).
- **Validación operativa**: correrlo en paralelo al proceso actual durante
  unas semanas sin reemplazar nada, y comparar cuántos problemas se
  habrían detectado antes si el equipo hubiera seguido las alertas.
- **Validación de utilidad real**: la métrica que importa no es la
  precisión del modelo sino si reduce quejas repetidas o cancelaciones en
  las zonas/clientes priorizados, medido antes/después.

## Riesgos, limitaciones y consideraciones de seguridad

- **Datos insuficientes al inicio**: con poco histórico, el modelo puede
  no tener suficiente señal — mitigación: empezar con reglas simples
  (umbrales) mientras se acumula suficiente historia para un modelo
  aprendido.
- **Sesgo por zona**: si el sistema prioriza siempre las mismas zonas
  (las que ya tienen más infraestructura de monitoreo), puede desatender
  zonas con menos datos pero igual de necesitadas — requiere revisión
  periódica del criterio, no solo confiar ciegamente en el score.
- **Privacidad**: el modelo usa datos de comportamiento y pago de
  clientes reales; debe aplicar los mismos principios que ya sigue
  ClickIA (mínima información necesaria, acceso restringido al personal
  autorizado, sin exponer estos datos en ninguna interfaz de cliente).
- **Falsos positivos con costo operativo**: marcar de más clientes como
  "en riesgo" desperdicia tiempo del equipo de retención — el umbral de
  alerta debe calibrarse con el equipo, no fijarse arbitrariamente.
- **Dependencia de un proveedor de IA externo** para la capa de
  explicación: igual que en ClickIA, debe degradar con una plantilla
  simple si el proveedor falla, no bloquear el panel completo.

## Estrategia de despliegue y mejora futura

- Desplegar primero como un panel interno de solo lectura, sin ninguna
  acción automática (el sistema sugiere, el equipo decide) — reduce el
  riesgo de una mala recomendación con consecuencias reales.
- Reutilizar la misma infraestructura de despliegue que ClickIA (mismo
  proveedor, mismo patrón de variables de entorno para credenciales).
- Mejora futura: una vez validado con uso real, conectar el panel con
  acciones automáticas de bajo riesgo (ej. agendar automáticamente una
  visita técnica preventiva cuando una zona cruza el umbral de alerta), y
  extender el mismo enfoque a otros ISPs regionales con necesidades
  similares.
