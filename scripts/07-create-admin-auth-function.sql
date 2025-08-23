-- Agregando DROP FUNCTION para eliminar función existente antes de recrearla
DROP FUNCTION IF EXISTS verify_admin_password(TEXT, TEXT);

-- Función para verificar contraseñas de administrador de forma segura
CREATE OR REPLACE FUNCTION verify_admin_password(
    p_email TEXT,
    p_password TEXT
)
RETURNS TABLE(
    id UUID,
    email VARCHAR(255), -- Cambiado de TEXT a VARCHAR(255)
    nombre VARCHAR(255), -- Cambiado de TEXT a VARCHAR(255)
    apellidos VARCHAR(255), -- Cambiado de TEXT a VARCHAR(255)
    telefono VARCHAR(20), -- Cambiado de TEXT a VARCHAR(20)
    activo BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.correo_institucional as email, -- Corregido nombre de columna
        a.nombre_completo as nombre, -- Corregido nombre de columna
        ''::VARCHAR(255) as apellidos, -- Cast explícito al tipo correcto
        ''::VARCHAR(20) as telefono, -- Cast explícito al tipo correcto
        true as activo -- Campo no existe en tabla administradores, asumiendo true
    FROM administradores a
    WHERE a.correo_institucional = p_email -- Corregido nombre de columna
    AND a.password_hash = crypt(p_password, a.password_hash)
    LIMIT 1;
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO authenticated;
