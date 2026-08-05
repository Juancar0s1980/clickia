CREATE TABLE solutions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id      UUID NOT NULL REFERENCES technical_problems (id) ON DELETE CASCADE,
    titulo          TEXT NOT NULL,
    pasos           JSONB NOT NULL DEFAULT '[]'::jsonb,
    recomendacion   TEXT
);

CREATE INDEX idx_solutions_problem_id ON solutions (problem_id);
