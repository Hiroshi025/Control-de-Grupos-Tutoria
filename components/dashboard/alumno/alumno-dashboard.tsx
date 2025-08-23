"use client"

import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout"
import { AlumnoHeader } from "./alumno-header"
import { EstadoAcademico } from "./estado-academico"
import { IndicadoresCriticos } from "./indicadores-criticos"
import { ProgresoCarrera } from "./progreso-carrera"
import { AccionesRapidas } from "./acciones-rapidas"
import { InfoTutor } from "./info-tutor"
import { MisTutorias } from "./mis-tutorias"
import { ReporteAcademico } from "./reporte-academico"

export function AlumnoDashboard() {
  const { user } = useAuth()

  if (!user || user.userType !== "alumno") {
    return null
  }

  return (
    <DashboardLayout userType="alumno">
      <div className="space-y-6">
        <AlumnoHeader alumno={user.profile} />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <EstadoAcademico alumno={user.profile} />
            <div className="grid md:grid-cols-2 gap-6">
              <IndicadoresCriticos alumno={user.profile} />
              <ProgresoCarrera alumno={user.profile} />
            </div>
            <MisTutorias alumnoId={user.profile.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AccionesRapidas />
            <InfoTutor alumnoId={user.profile.id} />
            <ReporteAcademico alumnoId={user.profile.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
