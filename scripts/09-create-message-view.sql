CREATE OR REPLACE VIEW vista_mensajes_con_remitente AS
SELECT
  m.*,
  CASE
    WHEN m.remitente_tipo = 'alumno' THEN a.nombre_completo
    WHEN m.remitente_tipo = 'profesor' THEN p.nombre_completo
    WHEN m.remitente_tipo = 'administrador' THEN ad.nombre_completo
    ELSE NULL
  END AS remitente_nombre
FROM mensajes m
LEFT JOIN alumnos a ON m.remitente_id = a.id AND m.remitente_tipo = 'alumno'
LEFT JOIN profesores p ON m.remitente_id = p.id AND m.remitente_tipo = 'profesor'
LEFT JOIN administradores ad ON m.remitente_id = ad.id AND m.remitente_tipo = 'administrador';