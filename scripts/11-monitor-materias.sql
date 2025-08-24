CREATE OR REPLACE FUNCTION reset_materias_actualmente_cursando()
RETURNS void AS $$
BEGIN
  UPDATE alumnos
  SET materias_actualmente_cursando = 0
  WHERE id IN (
    SELECT ag.alumno_id
    FROM alumno_grupo ag
    JOIN grupos g ON ag.grupo_id = g.id
    WHERE g.fin_de_semestre <= CURRENT_DATE
      AND ag.activo = true
  );
END;
$$ LANGUAGE plpgsql;