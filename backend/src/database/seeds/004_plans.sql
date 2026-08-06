-- Planes reales de DobleClick tal como se publican en su pagina (capturados el 2026-08-05).
-- El plan 16 (Triple 450 Mb) no trae precio porque no era visible en la fuente; se deja en
-- NULL a proposito para no inventar un valor, tanto aqui como en el chat/el panel Planes.
INSERT INTO plans (numero, categoria, nombre, velocidad_mb, incluye_tv, tv_canales, moviles_gb, precio_mensual, nota)
VALUES
    (1,  'doble',  'Combo Internet + TV',                  85,  false, NULL, NULL, 65000,  'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (2,  'doble',  'Combo Internet 100 Mb + TV',            100, true,  NULL, NULL, 60000,  'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (3,  'doble',  'Combo: Internet 150 Mb + TV',           150, true,  NULL, NULL, 70000,  'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (4,  'doble',  'Combo Internet 200 Mb + TV',            200, true,  NULL, NULL, 80000,  'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (5,  'doble',  'Combo Internet 250 Mb + TV',            250, true,  NULL, NULL, 90000,  'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (6,  'doble',  'Combo Internet 300 Mb + TV',            300, true,  NULL, NULL, 100000, 'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (7,  'doble',  'Combo Internet 350 Mb + TV',            350, true,  NULL, NULL, 120000, 'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (8,  'doble',  'Combo Internet 450 Mb + TV',            450, true,  NULL, NULL, 145000, 'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (10, 'triple', 'Triple Internet 100 Mb + TV + Móvil 20 Gb', 100, true, 90, 20, 80000,  'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (11, 'triple', 'Triple Internet 150 Mb + TV + Móvil 20 Gb', 150, true, 90, 20, 90000,  'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (12, 'triple', 'Triple Internet 200 Mb + TV + Móvil 20 Gb', 200, true, 90, 20, 90000,  'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (13, 'triple', 'Triple Internet 250 Mb + TV + Móvil 20 Gb', 250, true, 90, 20, 100000, 'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (14, 'triple', 'Triple Internet 300 Mb + TV + Móvil 20 Gb', 300, true, 90, 20, 110000, 'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (15, 'triple', 'Triple Internet 350 Mb + TV + Móvil 20 Gb', 350, true, 90, 20, 130000, 'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%.'),
    (16, 'triple', 'Triple Internet 450 Mb + TV + Móvil 20 Gb', 450, true, 90, 20, NULL,   'Plan solo para nuevos usuarios. Valor para estratos 1, 2 y 3; estratos 4, 5 y 6 incrementan IVA del 19%. Precio a confirmar con un asesor.');
