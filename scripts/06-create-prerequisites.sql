-- Corrigiendo para usar UUID en lugar de INTEGER
-- Crear tabla de prerrequisitos si no existe
CREATE TABLE IF NOT EXISTS prerrequisitos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    materia_id UUID REFERENCES materias(id) ON DELETE CASCADE,
    prerrequisito_id UUID REFERENCES materias(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(materia_id, prerrequisito_id)
);

-- Insertar prerrequisitos principales según el plan de estudios
DO $$
DECLARE
    carrera_id_var UUID;
BEGIN
    SELECT id INTO carrera_id_var FROM carreras WHERE codigo = 'IEME-2010-210';
    
    -- Limpiar prerrequisitos existentes
    DELETE FROM prerrequisitos WHERE materia_id IN (
        SELECT id FROM materias WHERE carrera_id = carrera_id_var
    );
    
    -- Prerrequisitos de Cálculo
    INSERT INTO prerrequisitos (materia_id, prerrequisito_id)
    SELECT m1.id, m2.id FROM materias m1, materias m2 
    WHERE m1.clave = 'ACF-0902' AND m2.clave = 'ACF-0901' 
    AND m1.carrera_id = carrera_id_var AND m2.carrera_id = carrera_id_var;
    
    INSERT INTO prerrequisitos (materia_id, prerrequisito_id)
    SELECT m1.id, m2.id FROM materias m1, materias m2 
    WHERE m1.clave = 'ACF-0904' AND m2.clave = 'ACF-0902' 
    AND m1.carrera_id = carrera_id_var AND m2.carrera_id = carrera_id_var;
    
    INSERT INTO prerrequisitos (materia_id, prerrequisito_id)
    SELECT m1.id, m2.id FROM materias m1, materias m2 
    WHERE m1.clave = 'ACF-0905' AND m2.clave = 'ACF-0904' 
    AND m1.carrera_id = carrera_id_var AND m2.carrera_id = carrera_id_var;
    
    -- Prerrequisitos de Mecánica
    INSERT INTO prerrequisitos (materia_id, prerrequisito_id)
    SELECT m1.id, m2.id FROM materias m1, materias m2 
    WHERE m1.clave = 'EME-1008' AND m2.clave = 'EME-1012' 
    AND m1.carrera_id = carrera_id_var AND m2.carrera_id = carrera_id_var;
    
    -- Prerrequisitos de Circuitos Eléctricos
    INSERT INTO prerrequisitos (materia_id, prerrequisito_id)
    SELECT m1.id, m2.id FROM materias m1, materias m2 
    WHERE m1.clave = 'EMF-1003' AND m2.clave = 'EMF-1004' 
    AND m1.carrera_id = carrera_id_var AND m2.carrera_id = carrera_id_var;
    
    -- Prerrequisitos de Electrónica
    INSERT INTO prerrequisitos (materia_id, prerrequisito_id)
    SELECT m1.id, m2.id FROM materias m1, materias m2 
    WHERE m1.clave = 'AEC-1022' AND m2.clave = 'AEF-1021' 
    AND m1.carrera_id = carrera_id_var AND m2.carrera_id = carrera_id_var;
    
END $$;
