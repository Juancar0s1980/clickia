-- Cuarta API externa del proyecto (OpenCage Geocoding, con API key): valida la direccion
-- de la casa del cliente y la convierte en coordenadas, para que el admin pueda abrir el
-- mapa exacto al despachar un tecnico. Todo nullable porque se degrada sin romper el
-- registro si la API no responde, no tiene key configurada, o la direccion no se pudo
-- geocodificar con confianza suficiente.
ALTER TABLE users
    ADD COLUMN direccion_lat NUMERIC(9, 6),
    ADD COLUMN direccion_lon NUMERIC(9, 6),
    ADD COLUMN direccion_formateada TEXT,
    ADD COLUMN direccion_confianza SMALLINT;
