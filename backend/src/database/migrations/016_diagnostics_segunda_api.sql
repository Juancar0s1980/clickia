-- Persiste los datos relevantes obtenidos de la segunda API (clima) y de la tercera
-- (proveedor/ISP detectado) en el momento del diagnostico, en vez de usarlos solo en
-- memoria para la respuesta y descartarlos (requisito de la prueba tecnica, punto 9).
ALTER TABLE diagnostics
    ADD COLUMN weather_description TEXT,
    ADD COLUMN weather_is_severe BOOLEAN,
    ADD COLUMN isp_name TEXT,
    ADD COLUMN isp_city TEXT;
