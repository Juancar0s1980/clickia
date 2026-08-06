-- Temas de cuenta/comerciales que el chat tambien debe poder resolver (no solo
-- diagnostico tecnico de conectividad). "Cambiar contraseña" no esta aqui a proposito:
-- ese flujo no pasa por el chat/LLM (ver PATCH /api/users/me/password), para no exponer
-- contraseñas en texto libre a un proveedor de IA externo.
WITH mejorar_plan AS (
    INSERT INTO technical_problems (nombre, categoria, descripcion, nivel)
    VALUES (
        'Mejorar mi plan',
        'cuenta',
        'El usuario quiere ampliar o mejorar su plan de internet y/o TV contratado.',
        'bajo'
    )
    RETURNING id
)
INSERT INTO solutions (problem_id, titulo, pasos, recomendacion)
SELECT id, 'Opciones para mejorar tu plan',
    '["Revisa los planes disponibles en tu zona en la sección Planes",
      "Compara velocidades de internet y canales de TV según tu servicio actual",
      "Si deseas proceder, crea un ticket para que un asesor comercial te contacte con precios y disponibilidad"]'::jsonb,
    'Los cambios de plan y precios los confirma un asesor comercial; no se aplican automáticamente desde el chat.'
FROM mejorar_plan;
