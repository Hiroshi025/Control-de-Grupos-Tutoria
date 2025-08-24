-- Sistema de Control de Estudiantes Tutorados - ITSOEH
-- Esquema de Base de Datos Principal

-- Tabla de Administradores
CREATE TABLE IF NOT EXISTS administradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    correo_institucional VARCHAR(255) UNIQUE NOT NULL,
    edad INTEGER,
    foto_perfil TEXT,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Profesores
CREATE TABLE IF NOT EXISTS profesores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    correo_institucional VARCHAR(255) UNIQUE NOT NULL,
    edad INTEGER,
    foto_perfil TEXT,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Carreras
CREATE TABLE IF NOT EXISTS carreras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Materias
CREATE TABLE IF NOT EXISTS materias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    clave VARCHAR(20) UNIQUE NOT NULL,
    semestre INTEGER NOT NULL CHECK (semestre >= 1 AND semestre <= 12),
    carrera_id UUID REFERENCES carreras(id) ON DELETE CASCADE,
    tipo VARCHAR(20) DEFAULT 'obligatoria' CHECK (tipo IN ('obligatoria', 'optativa')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Grupos
CREATE TABLE IF NOT EXISTS grupos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    carrera_id UUID REFERENCES carreras(id) ON DELETE CASCADE,
    semestre INTEGER NOT NULL CHECK (semestre >= 1 AND semestre <= 12),
    horario_tutoria VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    fin_de_semestre DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    correo_institucional VARCHAR(255) UNIQUE NOT NULL,
    edad INTEGER,
    foto_credencial TEXT,
    fecha_inscripcion DATE NOT NULL,
    semestre_actual INTEGER NOT NULL CHECK (semestre_actual >= 1 AND semestre_actual <= 12),
    carrera_id UUID REFERENCES carreras(id) ON DELETE CASCADE,
    materias_aprobadas INTEGER DEFAULT 0,
    materias_sin_cursar INTEGER DEFAULT 0,
    materias_en_recurso INTEGER DEFAULT 0,
    materias_en_especial INTEGER DEFAULT 0,
    materias_actualmente_cursando INTEGER DEFAULT 0,
    servicio_social_realizado BOOLEAN DEFAULT false,
    residencia_profesional_realizada BOOLEAN DEFAULT false,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación Profesor-Grupo (muchos a muchos con historial)
CREATE TABLE IF NOT EXISTS profesor_grupo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profesor_id UUID REFERENCES profesores(id) ON DELETE CASCADE,
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    semestre VARCHAR(20) NOT NULL, -- Ej: "2024-1", "2024-2"
    activo BOOLEAN DEFAULT true,
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profesor_id, grupo_id, semestre)
);

-- Tabla de relación Alumno-Grupo (muchos a muchos con historial)
CREATE TABLE IF NOT EXISTS alumno_grupo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    semestre VARCHAR(20) NOT NULL, -- Ej: "2024-1", "2024-2"
    activo BOOLEAN DEFAULT true,
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(alumno_id, grupo_id, semestre)
);

-- Tabla de Sesiones de Tutoría
CREATE TABLE IF NOT EXISTS sesiones_tutoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profesor_id UUID REFERENCES profesores(id) ON DELETE CASCADE,
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    alumno_id UUID REFERENCES alumnos(id) ON DELETE SET NULL, -- NULL para sesiones grupales
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('grupal', 'individual')),
    fecha_sesion TIMESTAMP WITH TIME ZONE NOT NULL,
    objetivos TEXT,
    temas_tratados TEXT,
    acuerdos_compromisos TEXT,
    materias_reprobadas_parcial JSONB, -- Array de materias con parcial
    materias_a_recurso_final JSONB, -- Array de materias que van a recurso
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL, -- ID del usuario (alumno, profesor o admin)
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('alumno', 'profesor', 'administrador')),
    tipo_notificacion VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reportes_parciales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  materia VARCHAR(255) NOT NULL,
  motivo TEXT NOT NULL,
  profesor VARCHAR(255) NOT NULL,
  parcial INTEGER NOT NULL CHECK (parcial >= 1 AND parcial <= 3),
  semestre VARCHAR(20) NOT NULL,
  fecha_reporte TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación Alumno-Materia (materias cursando en el semestre)
CREATE TABLE IF NOT EXISTS materias_alumno (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
    materia_id UUID REFERENCES materias(id) ON DELETE CASCADE,
    semestre INTEGER NOT NULL CHECK (semestre >= 1 AND semestre <= 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(alumno_id, materia_id, semestre)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_alumnos_matricula ON alumnos(matricula);
CREATE INDEX IF NOT EXISTS idx_alumnos_carrera ON alumnos(carrera_id);
CREATE INDEX IF NOT EXISTS idx_profesores_correo ON profesores(correo_institucional);
CREATE INDEX IF NOT EXISTS idx_grupos_carrera_semestre ON grupos(carrera_id, semestre);
CREATE INDEX IF NOT EXISTS idx_profesor_grupo_activo ON profesor_grupo(profesor_id, activo);
CREATE INDEX IF NOT EXISTS idx_alumno_grupo_activo ON alumno_grupo(alumno_id, activo);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones_tutoria(fecha_sesion);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id, tipo_usuario, leida);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_administradores_updated_at BEFORE UPDATE ON administradores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profesores_updated_at BEFORE UPDATE ON profesores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alumnos_updated_at BEFORE UPDATE ON alumnos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grupos_updated_at BEFORE UPDATE ON grupos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sesiones_updated_at BEFORE UPDATE ON sesiones_tutoria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
