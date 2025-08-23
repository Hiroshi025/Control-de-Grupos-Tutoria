-- Función para administradores que coincide exactamente con el esquema de la tabla
CREATE OR REPLACE FUNCTION verify_admin_password(p_email VARCHAR, p_password VARCHAR)
RETURNS TABLE (
    id UUID,
    nombre_completo VARCHAR(255),
    correo_institucional VARCHAR(255),
    edad INTEGER,
    foto_perfil TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.nombre_completo,
        a.correo_institucional,
        a.edad,
        a.foto_perfil,
        a.created_at,
        a.updated_at
    FROM administradores a
    WHERE a.correo_institucional = p_email 
    AND a.password_hash = crypt(p_password, a.password_hash);
END;
$$ LANGUAGE plpgsql;

-- Función para alumnos que coincide exactamente con el esquema de la tabla
CREATE OR REPLACE FUNCTION verify_alumno_password(p_identifier VARCHAR, p_password VARCHAR)
RETURNS TABLE (
    id UUID,
    matricula VARCHAR(20),
    nombre_completo VARCHAR(255),
    correo_institucional VARCHAR(255),
    edad INTEGER,
    foto_credencial TEXT,
    fecha_inscripcion DATE,
    semestre_actual INTEGER,
    carrera_id UUID,
    materias_aprobadas INTEGER,
    materias_sin_cursar INTEGER,
    materias_en_recurso INTEGER,
    materias_en_especial INTEGER,
    servicio_social_realizado BOOLEAN,
    residencia_profesional_realizada BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.matricula,
        a.nombre_completo,
        a.correo_institucional,
        a.edad,
        a.foto_credencial,
        a.fecha_inscripcion,
        a.semestre_actual,
        a.carrera_id,
        a.materias_aprobadas,
        a.materias_sin_cursar,
        a.materias_en_recurso,
        a.materias_en_especial,
        a.servicio_social_realizado,
        a.residencia_profesional_realizada,
        a.created_at,
        a.updated_at
    FROM alumnos a
    WHERE (a.correo_institucional = p_identifier OR a.matricula = p_identifier)
    AND a.password_hash = p_password;
END;
$$ LANGUAGE plpgsql;

-- Función para profesores que coincide exactamente con el esquema de la tabla
CREATE OR REPLACE FUNCTION verify_profesor_password(p_email VARCHAR, p_password VARCHAR)
RETURNS TABLE (
    id UUID,
    nombre_completo VARCHAR(255),
    correo_institucional VARCHAR(255),
    edad INTEGER,
    foto_perfil TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre_completo,
        p.correo_institucional,
        p.edad,
        p.foto_perfil,
        p.created_at,
        p.updated_at
    FROM profesores p
    WHERE p.correo_institucional = p_email 
    AND p.password_hash = p_password;
END;
$$ LANGUAGE plpgsql;