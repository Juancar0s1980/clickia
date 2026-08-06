-- DobleClick tambien cubre Timbío (municipio vecino a Popayán, Cauca), ademas de las
-- zonas/barrios de Popayán ya sembrados en 002_network_status.sql.
INSERT INTO network_status (zone, service, status, estimated_time) VALUES
    ('Timbío', 'internet', 'operativo', NULL);
