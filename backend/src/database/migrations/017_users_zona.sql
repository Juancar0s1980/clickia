-- Zona del cliente (Centro/Norte/Sur/Occidente/Timbio), separada de la direccion:
-- permite al admin ubicar rapido a que sector despachar un tecnico sin tener que leer
-- la direccion completa. Nullable porque las cuentas admin no representan un cliente
-- con ubicacion fisica; el registro propio y la creacion por admin la exigen desde la
-- validacion.
ALTER TABLE users
    ADD COLUMN zona TEXT
        CHECK (zona IN ('Centro', 'Norte', 'Sur', 'Occidente', 'Timbío'));
