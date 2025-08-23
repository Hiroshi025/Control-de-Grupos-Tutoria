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
