import type { TourStep } from "@/components/onboarding/tour-guide"

export const alumnoTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido a tu Dashboard!",
    description: "Este es tu panel principal donde podrás ver toda tu información académica y gestionar tus tutorías.",
    target: '[data-tour="alumno-header"]',
    position: "bottom",
  },
  {
    id: "estado-academico",
    title: "Estado Académico",
    description: "Aquí puedes ver el resumen visual de tus materias: aprobadas, reprobadas, pendientes y especiales.",
    target: '[data-tour="estado-academico"]',
    position: "right",
  },
  {
    id: "indicadores-criticos",
    title: "Indicadores Importantes",
    description:
      "Revisa el estado de tu servicio social y residencia profesional. Los indicadores rojos requieren atención.",
    target: '[data-tour="indicadores-criticos"]',
    position: "bottom",
  },
  {
    id: "progreso-carrera",
    title: "Progreso de Carrera",
    description: "Esta barra muestra tu avance general en el plan de estudios de tu carrera.",
    target: '[data-tour="progreso-carrera"]',
    position: "bottom",
  },
  {
    id: "acciones-rapidas",
    title: "Acciones Rápidas",
    description: "Desde aquí puedes descargar tu kardex, agendar citas con tu tutor y ver tu historial.",
    target: '[data-tour="acciones-rapidas"]',
    position: "left",
  },
  {
    id: "reporte-academico",
    title: "Reporte Académico",
    description: "Usa esta sección para reportar materias reprobadas. Tu tutor recibirá una notificación automática.",
    target: '[data-tour="reporte-academico"]',
    position: "left",
  },
  {
    id: "mis-tutorias",
    title: "Mis Tutorías",
    description: "Aquí encontrarás el historial de todas tus sesiones de tutoría y los acuerdos establecidos.",
    target: '[data-tour="mis-tutorias"]',
    position: "top",
  },
]

export const profesorTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido Profesor!",
    description: "Desde aquí puedes gestionar todos tus grupos de tutoría y dar seguimiento a tus alumnos.",
    target: '[data-tour="profesor-header"]',
    position: "bottom",
  },
  {
    id: "grupos-asignados",
    title: "Grupos Asignados",
    description: "Esta es la lista de todos los grupos que tienes asignados para tutoría en el semestre actual.",
    target: '[data-tour="grupos-asignados"]',
    position: "bottom",
  },
  {
    id: "estadisticas-grupo",
    title: "Estadísticas del Grupo",
    description:
      "Cada grupo muestra estadísticas importantes: total de alumnos, alumnos en riesgo y próximas sesiones.",
    target: '[data-tour="estadisticas-grupo"]',
    position: "bottom",
  },
  {
    id: "lista-alumnos",
    title: "Lista de Alumnos",
    description:
      "Aquí verás todos los alumnos del grupo con indicadores de riesgo académico para identificar casos prioritarios.",
    target: '[data-tour="lista-alumnos"]',
    position: "bottom",
  },
  {
    id: "calendario-sesiones",
    title: "Calendario de Sesiones",
    description: "Programa y visualiza todas las sesiones de tutoría, tanto grupales como individuales.",
    target: '[data-tour="calendario-sesiones"]',
    position: "bottom",
  },
  {
    id: "nueva-sesion",
    title: "Registrar Nueva Sesión",
    description: "Usa este botón para registrar nuevas sesiones de tutoría con objetivos, temas y acuerdos.",
    target: '[data-tour="nueva-sesion"]',
    position: "left",
  },
]

export const adminTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido Administrador!",
    description:
      "Desde este panel puedes gestionar todo el sistema de tutorías: usuarios, asignaciones y estadísticas.",
    target: '[data-tour="admin-header"]',
    position: "bottom",
  },
  {
    id: "estadisticas-generales",
    title: "Estadísticas Generales",
    description: "Visualiza los KPIs principales del sistema: total de usuarios, sesiones y tendencias académicas.",
    target: '[data-tour="estadisticas-generales"]',
    position: "bottom",
  },
  {
    id: "gestion-usuarios",
    title: "Gestión de Usuarios",
    description: "Administra alumnos y profesores: crear, editar, eliminar y ver información detallada.",
    target: '[data-tour="gestion-usuarios"]',
    position: "bottom",
  },
  {
    id: "asignacion-tutores",
    title: "Asignación de Tutores",
    description: "Asigna profesores a grupos de alumnos y gestiona las relaciones tutor-tutorado.",
    target: '[data-tour="asignacion-tutores"]',
    position: "bottom",
  },
  {
    id: "carga-masiva",
    title: "Carga Masiva de Datos",
    description: "Importa información desde archivos Excel o CSV para actualizar datos de manera eficiente.",
    target: '[data-tour="carga-masiva"]',
    position: "bottom",
  },
  {
    id: "analytics-avanzado",
    title: "Analytics Avanzado",
    description: "Accede a métricas cruzadas y reportes avanzados para evaluar la efectividad del programa.",
    target: '[data-tour="analytics-avanzado"]',
    position: "bottom",
  },
]
