CREATE TABLE technical_problems (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT NOT NULL,
    categoria       TEXT NOT NULL,
    descripcion     TEXT NOT NULL,
    nivel           TEXT NOT NULL DEFAULT 'medio'
                        CHECK (nivel IN ('bajo', 'medio', 'alto'))
);

CREATE INDEX idx_technical_problems_categoria ON technical_problems (categoria);
