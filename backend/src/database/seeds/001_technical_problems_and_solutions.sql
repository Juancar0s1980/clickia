-- Base de conocimiento inicial que consulta el RAG Service (Fase 4).
-- Los "pasos" quedan en JSONB para que el frontend los renderice como checklist.

WITH sin_conexion AS (
    INSERT INTO technical_problems (nombre, categoria, descripcion, nivel)
    VALUES ('Internet sin conexión', 'conectividad',
            'El usuario no tiene acceso a internet en ningún dispositivo.', 'alto')
    RETURNING id
),
wifi_lento AS (
    INSERT INTO technical_problems (nombre, categoria, descripcion, nivel)
    VALUES ('WiFi lento', 'rendimiento',
            'La velocidad de la red inalámbrica es notablemente baja.', 'medio')
    RETURNING id
),
router_luz_roja AS (
    INSERT INTO technical_problems (nombre, categoria, descripcion, nivel)
    VALUES ('Router con luz roja', 'hardware',
            'El router muestra una luz indicadora en rojo o parpadeante.', 'alto')
    RETURNING id
),
no_conecta_dispositivo AS (
    INSERT INTO technical_problems (nombre, categoria, descripcion, nivel)
    VALUES ('Dispositivo no conecta a la red', 'conectividad',
            'Un celular, TV u otro dispositivo específico no logra conectarse al WiFi.', 'medio')
    RETURNING id
),
olvido_contrasena AS (
    INSERT INTO technical_problems (nombre, categoria, descripcion, nivel)
    VALUES ('Contraseña WiFi olvidada', 'acceso',
            'El usuario no recuerda la contraseña de su red WiFi.', 'bajo')
    RETURNING id
),
conexion_intermitente AS (
    INSERT INTO technical_problems (nombre, categoria, descripcion, nivel)
    VALUES ('Conexión intermitente', 'estabilidad',
            'La conexión se cae y se restablece de forma recurrente.', 'alto')
    RETURNING id
)
INSERT INTO solutions (problem_id, titulo, pasos, recomendacion)
SELECT id, 'Diagnóstico de conexión' ,
    '["Verifique las luces del router (Power, Internet, WiFi)",
      "Reinicie el router: apáguelo, espere 30 segundos y enciéndalo",
      "Compruebe que los cables de red estén bien conectados",
      "Verifique si hay mantenimiento programado en su zona"]'::jsonb,
    'Si tras reiniciar el router el problema persiste, escale a un ticket técnico.'
FROM sin_conexion
UNION ALL
SELECT id, 'Mejorar velocidad de WiFi',
    '["Acérquese al router o reduzca obstáculos entre el equipo y el router",
      "Revise cuántos dispositivos están conectados simultáneamente",
      "Reinicie el router",
      "Cambie el canal WiFi desde la app del proveedor si hay interferencia"]'::jsonb,
    'Si la velocidad no mejora tras estos pasos, puede haber saturación en la zona.'
FROM wifi_lento
UNION ALL
SELECT id, 'Interpretar luz roja del router',
    '["Identifique qué luz está en rojo: Power, Internet o WiFi",
      "Si es la luz de Internet, puede haber un corte del servicio en su zona",
      "Reinicie el router y espere 2 minutos",
      "Si la luz roja persiste, el equipo puede requerir revisión técnica"]'::jsonb,
    'Una luz roja de Internet junto con mantenimiento activo en la zona no requiere ticket, solo esperar.'
FROM router_luz_roja
UNION ALL
SELECT id, 'Conectar un dispositivo específico',
    '["Olvide la red WiFi en el dispositivo y vuelva a conectarse",
      "Verifique que la contraseña ingresada sea correcta",
      "Reinicie el dispositivo",
      "Confirme que el dispositivo soporte la banda de red (2.4GHz/5GHz)"]'::jsonb,
    'Si solo un dispositivo falla y los demás conectan bien, el problema es local a ese equipo.'
FROM no_conecta_dispositivo
UNION ALL
SELECT id, 'Recuperar contraseña WiFi',
    '["Revise la etiqueta física del router (usuario/clave por defecto)",
      "Ingrese a la app o portal del proveedor con su cuenta",
      "Restablezca la contraseña desde la sección de configuración de red"]'::jsonb,
    'Recomiende una contraseña nueva de al menos 12 caracteres al restablecerla.'
FROM olvido_contrasena
UNION ALL
SELECT id, 'Estabilizar conexión intermitente',
    '["Revise que el router no esté sobrecalentado ni cerca de otros equipos electrónicos",
      "Actualice el firmware del router si es posible",
      "Reinicie el router",
      "Verifique fallas reportadas en la zona a través del estado del servicio"]'::jsonb,
    'Caídas intermitentes con estado de servicio "operativo" suelen requerir revisión técnica presencial.'
FROM conexion_intermitente;
