-- Catalogo de planes comerciales (Internet, Internet+TV, Internet+TV+Movil).
-- El chat lo usa como fuente de verdad para precios (nunca debe inventarlos)
-- y el frontend lo muestra tal cual en el panel "Planes".
CREATE TABLE plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero          INT NOT NULL UNIQUE,
    categoria       TEXT NOT NULL CHECK (categoria IN ('doble', 'triple')),
    nombre          TEXT NOT NULL,
    velocidad_mb    INT NOT NULL,
    incluye_tv      BOOLEAN NOT NULL DEFAULT true,
    tv_canales      INT,
    moviles_gb      INT,
    precio_mensual  INT,
    nota            TEXT NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_plans_categoria ON plans (categoria);
