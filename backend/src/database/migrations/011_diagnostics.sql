-- Registra, por cada turno del chat, que problema (si alguno) se detecto y en que
-- contexto de red. No existia hasta ahora: el match se calculaba al vuelo en
-- chat.service.ts y se descartaba. Es la fuente de las estadisticas del panel de admin
-- ("fallas mas recurrentes").
CREATE TABLE diagnostics (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    problem_id          UUID REFERENCES technical_problems (id) ON DELETE SET NULL,
    zone                TEXT,
    network_status      TEXT,
    fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_diagnostics_problem_id ON diagnostics (problem_id);
CREATE INDEX idx_diagnostics_conversation_id ON diagnostics (conversation_id);
