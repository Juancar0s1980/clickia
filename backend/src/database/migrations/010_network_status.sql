-- Reemplaza el objeto estatico de backend/src/services/networkStatus.service.ts:
-- el estado de cada zona ahora es un dato real que un admin puede actualizar.
CREATE TABLE network_status (
    zone            TEXT PRIMARY KEY,
    service         TEXT NOT NULL DEFAULT 'internet',
    status          TEXT NOT NULL DEFAULT 'operativo'
                        CHECK (status IN ('operativo', 'mantenimiento', 'falla')),
    estimated_time  TEXT,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
