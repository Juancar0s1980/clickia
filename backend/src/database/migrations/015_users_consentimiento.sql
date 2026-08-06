-- Registro de que la persona acepto explicitamente el almacenamiento de sus datos y
-- conversaciones antes de guardarlos (requisito de la prueba tecnica, punto 6). Solo se
-- exige en el registro propio (self-service); las cuentas creadas por un admin (alta
-- individual o CSV) quedan en false porque no es la propia persona quien acepta ahi.
ALTER TABLE users
    ADD COLUMN acepto_datos BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN acepto_datos_at TIMESTAMPTZ;
