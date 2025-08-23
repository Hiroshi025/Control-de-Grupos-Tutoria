-- Limpiar y recrear el administrador con los datos correctos
-- Limpiar datos antiguos del administrador
DELETE FROM administradores WHERE correo_institucional IN ('21011073@itsoeh.edu.mx', 'admin@ITSOEH.edu.mx');

-- Crear el administrador con los datos correctos
INSERT INTO administradores (
    nombre_completo,
    correo_institucional,
    edad,
    password_hash,
    created_at,
    updated_at
) VALUES (
    'Hiroshi025 - Administrador Sistema',
    '21011073@itsoeh.edu.mx',
    25,
    crypt('123456789', gen_salt('bf')), -- Hash seguro de la contraseña 123456789
    NOW(),
    NOW()
);

-- Verificar que se creó correctamente
SELECT 
    nombre_completo,
    correo_institucional,
    edad,
    created_at,
    -- No mostrar el hash por seguridad
    CASE WHEN password_hash IS NOT NULL THEN 'Hash creado correctamente' ELSE 'Error: Hash no creado' END as password_status
FROM administradores 
WHERE correo_institucional = '21011073@itsoeh.edu.mx';
