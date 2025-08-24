# Sistema de Control de Estudiantes Tutorados - ITSOEH

Sistema web completo para la gestión de tutorías académicas del Instituto Tecnológico Superior del Occidente del Estado de Hidalgo.

## 🎯 Características Principales

### 👨‍🎓 Dashboard de Alumnos

- **Estado Académico Visual**: Gráficos interactivos de materias aprobadas/reprobadas
- **Indicadores Críticos**: Estado de Servicio Social y Residencia Profesional
- **Progreso de Carrera**: Barra de avance en el plan de estudios
- **Acciones Rápidas**: Descarga de kardex, agendar citas, historial de tutorías
- **Reporte Académico Proactivo**: Sistema para reportar materias reprobadas por parcial
- **Información del Tutor**: Datos de contacto y horarios de atención

### 👨‍🏫 Dashboard de Profesores

- **Gestión de Grupos**: Lista de grupos tutorados por semestre
- **Lista de Alumnos**: Tabla con indicadores de riesgo académico
- **Calendario de Sesiones**: Visualización de citas agendadas
- **Registro de Sesiones**: Historial completo de tutorías grupales e individuales
- **Herramientas de Seguimiento**: Formularios para objetivos, temas y compromisos

### 👨‍💼 Dashboard de Administradores

- **Estadísticas Generales**: KPIs y métricas del sistema
- **Gestión de Usuarios**: CRUD completo para alumnos y profesores
- **Asignación de Tutores**: Vinculación de profesores con grupos
- **Carga Masiva**: Importación desde Excel/CSV con validación
- **Gestión de Plan de Estudios**: Administración de materias por carrera

### 📱 Sistema de Comunicación

- **Centro de Notificaciones**: Alertas automáticas y notificaciones del sistema
- **Mensajería Interna**: Comunicación directa entre usuarios
- **Alertas Automáticas**: Recordatorios para servicio social, residencia y riesgo académico
- **Notificaciones en Tiempo Real**: Actualizaciones instantáneas de reportes y citas

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14 con App Router, React 18, TypeScript
- **UI/UX**: Tailwind CSS v4, shadcn/ui, Lucide Icons
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth con Row Level Security
- **Gráficos**: Recharts para visualizaciones interactivas
- **Formularios**: React Hook Form con validación
- **Fechas**: date-fns para manejo de fechas en español

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- Cuenta de Supabase
- Variables de entorno configuradas

### Pasos de Instalación

1. **Configurar Supabase**

   - Crear proyecto en Supabase
   - Ejecutar scripts de base de datos en orden:
     - `scripts/01-create-database-schema.sql`
     - `scripts/02-seed-initial-data.sql`
     - `scripts/03-create-communication-tables.sql`

2. **Variables de Entorno**
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   \`\`\`

3. **Instalación de Dependencias**
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **usuarios**: Información base de todos los usuarios
- **alumnos**: Datos específicos de estudiantes (matrícula, semestre, etc.)
- **profesores**: Información de docentes y tutores
- **administradores**: Datos de personal administrativo
- **grupos**: Grupos de tutoría por semestre
- **materias**: Plan de estudios y materias por carrera
- **sesiones_tutoria**: Registro de sesiones grupales e individuales
- **notificaciones**: Sistema de alertas y comunicación
- **mensajes**: Mensajería interna entre usuarios

### Funcionalidades de Seguridad

- **Row Level Security (RLS)**: Protección de datos por usuario
- **Políticas de Acceso**: Restricciones basadas en tipo de usuario
- **Autenticación Segura**: Tokens JWT y refresh tokens
- **Validación de Datos**: Constraints y triggers en base de datos

## 🎨 Diseño y UX

### Paleta de Colores Institucional

- **Primario**: Verde institucional (#059669) - Crecimiento y aprendizaje
- **Secundario**: Azul académico (#0284c7) - Confianza y profesionalismo
- **Acentos**: Naranja energético (#ea580c) - Motivación y acción
- **Neutrales**: Grises balanceados para legibilidad

### Tipografía

- **Headings**: Geist Sans (pesos 400, 600, 700)
- **Body**: Manrope (pesos 400, 500)
- **Monospace**: Geist Mono para códigos

### Principios de Diseño

- **Mobile First**: Diseño responsive desde dispositivos móviles
- **Accesibilidad**: Contraste WCAG AA, navegación por teclado
- **Consistencia**: Componentes reutilizables y patrones uniformes
- **Claridad**: Jerarquía visual clara y espaciado generoso

## 📱 Funcionalidades por Tipo de Usuario

### Alumnos

- ✅ Visualización de estado académico completo
- ✅ Reporte proactivo de materias reprobadas
- ✅ Seguimiento de servicio social y residencia
- ✅ Historial de sesiones de tutoría
- ✅ Comunicación directa con tutor asignado
- ✅ Descarga de documentos académicos

### Profesores

- ✅ Gestión completa de grupos tutorados
- ✅ Identificación de alumnos en riesgo
- ✅ Registro detallado de sesiones de tutoría
- ✅ Calendario de citas y seguimiento
- ✅ Herramientas de comunicación con alumnos
- ✅ Reportes grupales e individuales

### Administradores

- ✅ Panel de control con métricas del sistema
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Asignación flexible de tutores a grupos
- ✅ Importación masiva de datos
- ✅ Configuración del plan de estudios
- ✅ Supervisión general del sistema

## 🔔 Sistema de Notificaciones

### Tipos de Alertas

- **Reportes Académicos**: Notificación automática a tutores
- **Citas Agendadas**: Confirmación para ambas partes
- **Alertas de Riesgo**: Materias reprobadas, servicio social pendiente
- **Recordatorios**: Fechas importantes y plazos
- **Mensajes**: Comunicación directa entre usuarios

### Prioridades

- **Crítica**: Riesgo académico alto, residencia pendiente
- **Alta**: Reportes académicos, alertas de servicio social
- **Normal**: Citas agendadas, confirmaciones
- **Baja**: Recordatorios generales

## 🔒 Seguridad y Privacidad

- **Autenticación Robusta**: Email/contraseña con verificación
- **Autorización Granular**: Permisos específicos por tipo de usuario
- **Protección de Datos**: RLS en todas las tablas sensibles
- **Auditoría**: Logs de acciones importantes
- **Encriptación**: Datos sensibles protegidos en tránsito y reposo

## 📈 Métricas y Reportes

### Indicadores Clave (KPIs)

- Total de alumnos, profesores y grupos activos
- Distribución de alumnos por semestre
- Estado de servicio social y residencia profesional
- Tendencia de sesiones de tutoría por mes
- Índices de riesgo académico

### Reportes Disponibles

- Reporte académico individual por alumno
- Reporte grupal por tutor
- Estadísticas generales del sistema
- Análisis de tendencias académicas

## 🤝 Créditos

**Desarrollado por**: Hiroshi025  
**Institución**: Instituto Tecnológico Superior del Occidente del Estado de Hidalgo (ITSOEH)  
**Propósito**: Mejorar el seguimiento académico y la comunicación en el proceso de tutorías

---

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al administrador del sistema o al departamento de servicios escolares del ITSOEH.

**Versión**: 1.0.0  
**Última actualización**: Enero 2025

## 🆕 Lógica y Mecánica de Reporte Académico por Parcial

### Reporte Proactivo de Materias Reprobadas

- **Cada alumno debe realizar 3 reportes por semestre**, uno por cada parcial (Parcial 1, 2 y 3).
- El reporte puede realizarse mediante un formulario web o cargando un archivo Excel desde el dashboard del alumno.
- Cada reporte incluye: materia reprobada, motivo, profesor y parcial correspondiente.

### Procesamiento y Actualización de Estado Académico

- **Al finalizar el tercer reporte (Parcial 3):**
  - Las materias aprobadas y reprobadas se descuentan de la carga académica total de la carrera.
  - El sistema actualiza automáticamente los datos del alumno:
    - Materias aprobadas
    - Materias en recurso
    - Materias en especial
    - Materias sin cursar
- **Regla especial:** Si una materia es reportada como reprobada por segunda vez (en dos semestres distintos), se marca como "especial" para el semestre siguiente y se notifica al tutor.

### Flujo de Reporte

1. **Captura del reporte:** El alumno registra materias reprobadas por parcial.
2. **Validación:** El sistema verifica que no se excedan los 3 reportes por semestre.
3. **Procesamiento final:** Al enviar el tercer reporte, el sistema:
   - Actualiza el avance académico del alumno.
   - Marca materias como "especial" si han sido reprobadas dos veces.
   - Notifica automáticamente al tutor sobre materias en especial y riesgo académico.

### Ejemplo de Uso

- El alumno reporta en cada parcial las materias reprobadas.
- Al finalizar el semestre, el sistema ajusta la carga académica y el historial del alumno.
- Si una materia es reprobada dos veces, se considera especial y requiere atención adicional en el siguiente semestre.

En Supabase/PostgreSQL, puedes automatizar el reseteo de `materias_actualmente_cursando` usando una **función y un job programado** (pg_cron o Supabase Scheduled Functions).

### Opción 1: Usar Supabase Scheduled Functions (recomendado en Supabase)

1. **Crea una función SQL para resetear el campo:**
````sql
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
````

2. **Programa la función desde Supabase Studio:**
   - Ve a "Scheduled Functions" y crea una tarea que ejecute `SELECT reset_materias_actualmente_cursando();` cada día o al final de cada semestre.

---

### Opción 2: Usar pg_cron (si tienes acceso al servidor)

1. Instala la extensión `pg_cron` en tu base de datos.
2. Programa el job:
````sql
SELECT cron.schedule('reset-materias', '0 0 * * *', $$SELECT reset_materias_actualmente_cursando();$$);
````

---

**Resumen:**  
La tarea programada ejecuta la función cada día (o cuando lo definas), y resetea el campo para los alumnos cuyo grupo terminó el semestre. Así no necesitas hacerlo manualmente.

¿Quieres el ejemplo para Supabase Edge Functions (TypeScript) también?