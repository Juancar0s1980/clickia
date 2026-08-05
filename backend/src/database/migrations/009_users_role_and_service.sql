ALTER TABLE users
    ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin')),
    ADD COLUMN tipo_servicio TEXT NOT NULL DEFAULT 'wifi'
        CHECK (tipo_servicio IN ('wifi', 'tv', 'wifi_tv'));

CREATE INDEX idx_users_role ON users (role);
