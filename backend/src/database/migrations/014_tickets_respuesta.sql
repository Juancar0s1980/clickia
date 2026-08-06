-- Permite al admin dejar una respuesta escrita al atender un ticket, ademas de cambiar
-- su estado. fecha_respuesta queda NULL hasta que se guarda la primera respuesta.
ALTER TABLE tickets
    ADD COLUMN respuesta TEXT,
    ADD COLUMN fecha_respuesta TIMESTAMPTZ;
