-- Aumentando el tamaño del campo codigo en carreras de 10 a 20 caracteres
ALTER TABLE carreras ALTER COLUMN codigo TYPE VARCHAR(20);

-- Corrigiendo para usar el esquema real sin columnas inexistentes
-- Actualizar carrera de Electromecánica usando solo las columnas que existen
UPDATE carreras 
SET 
    nombre = 'Ingeniería Electromecánica',
    codigo = 'IEME-2010-210'
WHERE codigo = 'IEM' OR nombre LIKE '%Electromecánica%';

-- Si no existe, crear la carrera
INSERT INTO carreras (nombre, codigo)
SELECT 'Ingeniería Electromecánica', 'IEME-2010-210'
WHERE NOT EXISTS (SELECT 1 FROM carreras WHERE codigo = 'IEME-2010-210');

-- Agregando columnas necesarias a la tabla materias
ALTER TABLE materias 
ADD COLUMN IF NOT EXISTS creditos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS horas_teoria INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS horas_practica INTEGER DEFAULT 0;

-- Obtener ID de la carrera
DO $$
DECLARE
    carrera_id_var UUID;
BEGIN
    SELECT id INTO carrera_id_var FROM carreras WHERE codigo = 'IEME-2010-210';
    
    -- Limpiar materias existentes de esta carrera
    DELETE FROM materias WHERE carrera_id = carrera_id_var;
    
    -- PRIMER SEMESTRE (33 créditos)
    INSERT INTO materias (nombre, clave, creditos, horas_teoria, horas_practica, semestre, carrera_id, tipo) VALUES
    ('Cálculo Diferencial', 'ACF-0901', 5, 3, 2, 1, carrera_id_var, 'obligatoria'),
    ('Álgebra Lineal', 'ACF-0903', 5, 3, 2, 1, carrera_id_var, 'obligatoria'),
    ('Química', 'AEC-1058', 4, 2, 2, 1, carrera_id_var, 'obligatoria'),
    ('Introducción a la Programación', 'EMH-1016', 4, 1, 3, 1, carrera_id_var, 'obligatoria'),
    ('Fundamentos de Investigación', 'ACC-0906', 4, 2, 2, 1, carrera_id_var, 'obligatoria'),
    ('Dibujo Electromecánico', 'AEF-1390', 5, 3, 2, 1, carrera_id_var, 'obligatoria'),
    ('Taller de Ética', 'ACA-0907', 4, 0, 4, 1, carrera_id_var, 'obligatoria'),
    ('Actividades Complementarias I', 'AC-001', 2, 0, 0, 1, carrera_id_var, 'optativa');

    -- SEGUNDO SEMESTRE (34 créditos)
    INSERT INTO materias (nombre, clave, creditos, horas_teoria, horas_practica, semestre, carrera_id, tipo) VALUES
    ('Cálculo Integral', 'ACF-0902', 5, 3, 2, 2, carrera_id_var, 'obligatoria'),
    ('Estática', 'EME-1012', 4, 3, 1, 2, carrera_id_var, 'obligatoria'),
    ('Electricidad y Magnetismo', 'EMC-1011', 4, 2, 2, 2, carrera_id_var, 'obligatoria'),
    ('Tecnología de los Materiales', 'EME-1028', 4, 3, 1, 2, carrera_id_var, 'obligatoria'),
    ('Taller de Investigación I', 'ACA-0909', 4, 0, 4, 2, carrera_id_var, 'obligatoria'),
    ('Desarrollo Sustentable', 'ACD-0908', 5, 2, 3, 2, carrera_id_var, 'obligatoria'),
    ('Metrología y Normalización', 'AEC-1047', 4, 2, 2, 2, carrera_id_var, 'obligatoria'),
    ('Procesos de Manufactura', 'EMC-1022', 4, 2, 2, 2, carrera_id_var, 'obligatoria');

    -- TERCER SEMESTRE (34 créditos)
    INSERT INTO materias (nombre, clave, creditos, horas_teoria, horas_practica, semestre, carrera_id, tipo) VALUES
    ('Cálculo Vectorial', 'ACF-0904', 5, 3, 2, 3, carrera_id_var, 'obligatoria'),
    ('Dinámica', 'EME-1008', 4, 3, 1, 3, carrera_id_var, 'obligatoria'),
    ('Mecánica de Fluidos', 'EME-1020', 4, 3, 1, 3, carrera_id_var, 'obligatoria'),
    ('Análisis de Circuitos Eléctricos de CD', 'EMF-1004', 5, 3, 2, 3, carrera_id_var, 'obligatoria'),
    ('Análisis y Síntesis de Mecanismos', 'EME-1005', 4, 3, 1, 3, carrera_id_var, 'obligatoria'),
    ('Taller de Investigación II', 'ACA-0910', 4, 0, 4, 3, carrera_id_var, 'obligatoria'),
    ('Administración y Técnicas de Mantenimiento', 'EMJ-1001', 6, 4, 2, 3, carrera_id_var, 'obligatoria'),
    ('Actividades Complementarias II', 'AC-002', 1, 0, 0, 3, carrera_id_var, 'optativa');

    -- CUARTO SEMESTRE (28 créditos)
    INSERT INTO materias (nombre, clave, creditos, horas_teoria, horas_practica, semestre, carrera_id, tipo) VALUES
    ('Ecuaciones Diferenciales', 'ACF-0905', 5, 3, 2, 4, carrera_id_var, 'obligatoria'),
    ('Probabilidad y Estadística', 'AEE-1051', 4, 3, 1, 4, carrera_id_var, 'obligatoria'),
    ('Termodinámica', 'EME-1029', 4, 3, 1, 4, carrera_id_var, 'obligatoria'),
    ('Análisis de Circuitos Eléctricos de CA', 'EMF-1003', 5, 3, 2, 4, carrera_id_var, 'obligatoria'),
    ('Sistemas y Máquinas de Fluidos', 'EMJ-1026', 6, 4, 2, 4, carrera_id_var, 'obligatoria'),
    ('Refrigeración y Aire Acondicionado', 'EMF-1023', 5, 3, 2, 4, carrera_id_var, 'obligatoria'),
    ('Actividades Complementarias III', 'AC-003', 1, 0, 0, 4, carrera_id_var, 'optativa');

    -- QUINTO SEMESTRE (27 créditos)
    INSERT INTO materias (nombre, clave, creditos, horas_teoria, horas_practica, semestre, carrera_id, tipo) VALUES
    ('Electrónica Analógica', 'AEF-1021', 5, 3, 2, 5, carrera_id_var, 'obligatoria'),
    ('Electrónica Digital', 'AEC-1022', 4, 2, 2, 5, carrera_id_var, 'obligatoria'),
    ('Transferencia de Calor', 'EME-1030', 4, 3, 1, 5, carrera_id_var, 'obligatoria'),
    ('Sistemas Hidráulicos y Neumáticos de Potencia', 'EMJ-1025', 6, 4, 2, 5, carrera_id_var, 'obligatoria'),
    ('Máquinas Eléctricas', 'EMJ-1017', 6, 4, 2, 5, carrera_id_var, 'obligatoria'),
    ('Actividades Complementarias IV', 'AC-004', 1, 0, 0, 5, carrera_id_var, 'optativa');

    -- SEXTO SEMESTRE (29 créditos)
    INSERT INTO materias (nombre, clave, creditos, horas_teoria, horas_practica, semestre, carrera_id, tipo) VALUES
    ('Mecánica de Materiales', 'EMJ-1021', 6, 4, 2, 6, carrera_id_var, 'obligatoria'),
    ('Máquinas y Equipos Térmicos I', 'EMC-1018', 4, 2, 2, 6, carrera_id_var, 'obligatoria'),
    ('Sistemas Eléctricos de Potencia', 'EMF-1024', 5, 3, 2, 6, carrera_id_var, 'obligatoria'),
    ('Controles Eléctricos', 'EMF-1006', 5, 3, 2, 6, carrera_id_var, 'obligatoria'),
    ('Diseño e Ingeniería Asistidos por Computadora', 'EMC-1010', 4, 2, 2, 6, carrera_id_var, 'obligatoria'),
    ('Especialidad I', 'ESP-001', 5, 2, 3, 6, carrera_id_var, 'optativa');

    -- SÉPTIMO SEMESTRE (33 créditos)
    INSERT INTO materias (nombre, clave, creditos, horas_teoria, horas_practica, semestre, carrera_id, tipo) VALUES
    ('Máquinas y Equipos Térmicos II', 'EMC-1019', 4, 2, 2, 7, carrera_id_var, 'obligatoria'),
    ('Subestaciones Eléctricas', 'EMF-1027', 5, 3, 2, 7, carrera_id_var, 'obligatoria'),
    ('Ingeniería de Control Clásico', 'EMJ-1014', 6, 4, 2, 7, carrera_id_var, 'obligatoria'),
    ('Formulación y Evaluación de Proyectos', 'EMC-1013', 4, 2, 2, 7, carrera_id_var, 'obligatoria'),
    ('Especialidad II', 'ESP-002', 5, 2, 3, 7, carrera_id_var, 'optativa'),
    ('Especialidad III', 'ESP-003', 5, 2, 3, 7, carrera_id_var, 'optativa'),
    ('Especialidad IV', 'ESP-004', 5, 2, 3, 7, carrera_id_var, 'optativa');

    -- OCTAVO SEMESTRE (10 créditos)
    INSERT INTO materias (nombre, clave, creditos, horas_teoria, horas_practica, semestre, carrera_id, tipo) VALUES
    ('Diseño de Elementos de Máquina', 'EMF-1009', 5, 3, 2, 8, carrera_id_var, 'obligatoria'),
    ('Instalaciones Eléctricas', 'EMF-1015', 5, 3, 2, 8, carrera_id_var, 'obligatoria'),
    ('Ahorro de Energía', 'EMJ-1002', 6, 4, 2, 8, carrera_id_var, 'obligatoria'),
    ('Especialidad V', 'ESP-005', 5, 2, 3, 8, carrera_id_var, 'optativa');

    -- NOVENO SEMESTRE (32 créditos)
    INSERT INTO materias (nombre, clave, creditos, horas_teoria, horas_practica, semestre, carrera_id, tipo) VALUES
    ('Residencia Profesional', 'RP-001', 10, 0, 0, 9, carrera_id_var, 'obligatoria'),
    ('Servicio Social', 'SS-001', 10, 0, 0, 9, carrera_id_var, 'obligatoria');

END $$;
