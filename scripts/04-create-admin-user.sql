-- Corrigiendo para usar la tabla administradores directamente según el esquema real
-- Crear perfil de administrador por defecto usando la tabla administradores
INSERT INTO administradores (
    nombre_completo,
    correo_institucional,
    edad,
    password_hash,
    created_at
) VALUES (
    'Administrador Sistema ITSOEH',
    '21011073@itsoeh.edu.mx',
    25,
    crypt('123456789', gen_salt('bf')), -- Hash seguro de la contraseña
    NOW()
) ON CONFLICT (correo_institucional) DO NOTHING;
