CREATE SEQUENCE ticket_seq START 1;

CREATE TABLE tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    conversation_id UUID REFERENCES conversations (id) ON DELETE SET NULL,
    ticket_number   TEXT NOT NULL UNIQUE
                        DEFAULT ('TCK-' || lpad(nextval('ticket_seq')::text, 6, '0')),
    descripcion     TEXT NOT NULL,
    prioridad       TEXT NOT NULL DEFAULT 'media'
                        CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
    estado          TEXT NOT NULL DEFAULT 'abierto'
                        CHECK (estado IN ('abierto', 'en_proceso', 'resuelto', 'cerrado')),
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_user_id ON tickets (user_id);
CREATE INDEX idx_tickets_estado ON tickets (estado);
