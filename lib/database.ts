import { createServerClient } from "@supabase/ssr"

export function createClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No-op for server-side rendering
      },
    },
  })
}

// Tipos TypeScript para las tablas de la base de datos
export interface Alumno {
  id: string
  matricula: string
  nombre_completo: string
  correo_institucional: string
  edad?: number
  foto_credencial?: string
  fecha_inscripcion: string
  semestre_actual: number
  carrera_id: string
  materias_aprobadas: number
  materias_sin_cursar: number
  materias_en_recurso: number
  materias_en_especial: number
  servicio_social_realizado: boolean
  residencia_profesional_realizada: boolean
  created_at: string
  updated_at: string
}

export interface Profesor {
  id: string
  nombre_completo: string
  correo_institucional: string
  edad?: number
  foto_perfil?: string
  created_at: string
  updated_at: string
}

export interface Administrador {
  id: string
  nombre_completo: string
  correo_institucional: string
  edad?: number
  foto_perfil?: string
  created_at: string
  updated_at: string
}

export interface Grupo {
  id: string
  nombre: string
  carrera_id: string
  semestre: number
  horario_tutoria?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface SesionTutoria {
  id: string
  profesor_id: string
  grupo_id: string
  alumno_id?: string
  tipo: "grupal" | "individual"
  fecha_sesion: string
  objetivos?: string
  temas_tratados?: string
  acuerdos_compromisos?: string
  materias_reprobadas_parcial?: any
  materias_a_recurso_final?: any
  created_at: string
  updated_at: string
}
