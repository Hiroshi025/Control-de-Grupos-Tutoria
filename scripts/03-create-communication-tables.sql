-- Eliminando referencias a auth.users y corrigiendo estructura para usuarios separados
-- Eliminar tablas existentes si tienen problemas de estructura
DROP TABLE IF EXISTS alertas_automaticas CASCADE;
DROP TABLE IF EXISTS mensajes CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;

-- Crear tablas para el sistema de comunicación
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL, -- Sin foreign key constraint para permitir usuarios de diferentes tablas
    usuario_tipo VARCHAR(20) NOT NULL, -- 'administrador', 'profesor', 'alumno'
    tipo VARCHAR(50) NOT NULL, -- 'reporte_academico', 'cita_agendada', 'recordatorio', 'mensaje'
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Manteniendo nombre original
    fecha_lectura TIMESTAMP WITH TIME ZONE,
    datos_adicionales JSONB, -- Para almacenar información específica del tipo de notificación
    prioridad VARCHAR(20) DEFAULT 'normal' -- 'baja', 'normal', 'alta', 'critica'
);

CREATE TABLE IF NOT EXISTS mensajes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    remitente_id UUID NOT NULL, -- Sin foreign key constraint
    remitente_tipo VARCHAR(20) NOT NULL, -- 'administrador', 'profesor', 'alumno'
    destinatario_id UUID NOT NULL, -- Sin foreign key constraint
    destinatario_tipo VARCHAR(20) NOT NULL, -- 'administrador', 'profesor', 'alumno'
    asunto VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_lectura TIMESTAMP WITH TIME ZONE,
    tipo_conversacion VARCHAR(50) DEFAULT 'individual' -- 'individual', 'grupal'
);

CREATE TABLE IF NOT EXISTS alertas_automaticas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL, -- Sin foreign key constraint
    usuario_tipo VARCHAR(20) NOT NULL, -- 'administrador', 'profesor', 'alumno'
    tipo_alerta VARCHAR(50) NOT NULL, -- 'servicio_social', 'residencia', 'materias_riesgo'
    condicion_trigger JSONB NOT NULL, -- Condiciones que activan la alerta
    mensaje_template TEXT NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_ejecucion TIMESTAMP WITH TIME ZONE
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_fecha ON notificaciones(usuario_id, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo_usuario ON notificaciones(usuario_tipo, usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON mensajes(destinatario_id, fecha_envio DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id, fecha_envio DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_tipos ON mensajes(destinatario_tipo, remitente_tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_usuario ON alertas_automaticas(usuario_id, activa);

-- Función actualizada para trabajar con tipos de usuario
CREATE OR REPLACE FUNCTION crear_notificacion(
    p_usuario_id UUID,
    p_usuario_tipo VARCHAR(20),
    p_tipo VARCHAR(50),
    p_titulo VARCHAR(255),
    p_mensaje TEXT,
    p_prioridad VARCHAR(20) DEFAULT 'normal',
    p_datos_adicionales JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    notificacion_id UUID;
BEGIN
    INSERT INTO notificaciones (usuario_id, usuario_tipo, tipo, titulo, mensaje, prioridad, datos_adicionales)
    VALUES (p_usuario_id, p_usuario_tipo, p_tipo, p_titulo, p_mensaje, p_prioridad, p_datos_adicionales)
    RETURNING id INTO notificacion_id;
    
    RETURN notificacion_id;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION marcar_notificacion_leida(p_notificacion_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notificaciones 
    SET leida = TRUE, fecha_lectura = NOW()
    WHERE id = p_notificacion_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Insertar notificaciones de prueba para el administrador
INSERT INTO notificaciones (usuario_id, usuario_tipo, tipo, titulo, mensaje, prioridad) VALUES
('9b38d6fc-3d74-4407-9763-dbdd0cc5d402', 'administrador', 'sistema', 'Bienvenido al Sistema', 'Sistema de control de estudiantes tutorados iniciado correctamente.', 'normal'),
('9b38d6fc-3d74-4407-9763-dbdd0cc5d402', 'administrador', 'recordatorio', 'Configuración Inicial', 'Recuerda configurar los grupos y asignar tutores para el semestre actual.', 'alta');
