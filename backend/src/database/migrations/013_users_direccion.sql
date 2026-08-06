-- Direccion de instalacion del servicio. Default vacio para no romper las filas ya
-- existentes; el registro (propio, por admin o via CSV) la exige desde la validacion.
ALTER TABLE users
    ADD COLUMN direccion TEXT NOT NULL DEFAULT '';
