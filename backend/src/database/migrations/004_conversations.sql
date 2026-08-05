CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    estado          TEXT NOT NULL DEFAULT 'abierta'
                        CHECK (estado IN ('abierta', 'resuelta', 'escalada', 'cerrada')),
    fecha_inicio    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_user_id ON conversations (user_id);
CREATE INDEX idx_conversations_estado ON conversations (estado);
