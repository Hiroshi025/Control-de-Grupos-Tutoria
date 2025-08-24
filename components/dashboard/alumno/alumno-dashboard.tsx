"use client";

import { useEffect, useState } from "react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/auth-client";

import { AccionesRapidas } from "./acciones-rapidas";
import { AlumnoHeader } from "./alumno-header";
import { EstadoAcademico } from "./estado-academico";
import { IndicadoresCriticos } from "./indicadores-criticos";
import { InfoTutor } from "./info-tutor";
import { MisTutorias } from "./mis-tutorias";
import { ProgresoCarrera } from "./progreso-carrera";
import { RegistroMateriasActuales } from "./registro-materias-actuales";
import { ReporteAcademico } from "./reporte-academico";
import { ReporteParcial } from "./reporte-parcial";

export function AlumnoDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"principal" | "reportes">("principal");
  const [materiasRegistradas, setMateriasRegistradas] = useState<
    boolean | null
  >(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificarMaterias() {
      setVerificando(true);
      if (
        !user ||
        !user.profile ||
        !user.profile.id ||
        !user.profile.semestre_actual
      ) {
        setMateriasRegistradas(null);
        setVerificando(false);
        return;
      }
      const supabase = createClient();

      // 1. Verificar si el grupo del alumno está activo y no ha pasado la fecha de fin_de_semestre
      const { data: alumnoGrupo } = await supabase
        .from("alumno_grupo")
        .select("grupo_id")
        .eq("alumno_id", user.profile.id)
        .eq("activo", true)
        .single();

      let grupoActivo = true;
      if (alumnoGrupo?.grupo_id) {
        const { data: grupo } = await supabase
          .from("grupos")
          .select("fin_de_semestre")
          .eq("id", alumnoGrupo.grupo_id)
          .single();
        if (grupo?.fin_de_semestre) {
          const finSem = new Date(grupo.fin_de_semestre);
          if (finSem < new Date()) {
            // Resetear materias_actualmente_cursando si el semestre terminó
            await supabase
              .from("alumnos")
              .update({ materias_actualmente_cursando: 0 })
              .eq("id", user.profile.id);
            grupoActivo = false;
          }
        }
      }

      // 2. Verificar si el alumno tiene materias_actualmente_cursando > 0
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("materias_actualmente_cursando")
        .eq("id", user.profile.id)
        .single();

      setMateriasRegistradas(
        grupoActivo && alumno?.materias_actualmente_cursando > 0
      );
      setVerificando(false);
    }
    if (
      user &&
      user.userType === "alumno" &&
      user.profile?.id &&
      user.profile?.semestre_actual
    ) {
      verificarMaterias();
    }
  }, [user?.profile?.id, user?.profile?.semestre_actual]);

  if (!user || user.userType !== "alumno") {
    return null;
  }

  // Esperar a que termine la verificación antes de mostrar el dashboard
  if (verificando || materiasRegistradas === null) {
    return (
      <DashboardLayout userType="alumno">
        <div className="max-w-xl mx-auto mt-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center space-y-4">
            <h2 className="text-xl font-bold text-gray-700">
              Verificando materias registradas...
            </h2>
            <p className="text-gray-600">Por favor espera un momento.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Bloqueo si no ha registrado materias
  if (materiasRegistradas === false) {
    return (
      <DashboardLayout userType="alumno">
        <div className="max-w-xl mx-auto mt-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-4">
            <h2 className="text-xl font-bold text-red-700">
              Registro de Materias Obligatorio
            </h2>
            <p className="text-red-600">
              Debes registrar las materias que vas a cursar este semestre antes
              de acceder al resto de la plataforma.
            </p>
            <RegistroMateriasActuales
              alumnoId={user.profile.id}
              semestre={user.profile.semestre_actual}
              onRegistro={async () => {
                // Actualiza el campo materias_actualmente_cursando en la DB
                const supabase = createClient();
                // Puedes sumar el número de materias seleccionadas en el registro
                const { data: materiasAlumno } = await supabase
                  .from("materias_alumno")
                  .select("id")
                  .eq("alumno_id", user.profile.id)
                  .eq("semestre", user.profile.semestre_actual);
                await supabase
                  .from("alumnos")
                  .update({
                    materias_actualmente_cursando: materiasAlumno?.length || 0,
                  })
                  .eq("id", user.profile.id);
                setMateriasRegistradas(true);
              }}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="alumno">
      <div className="space-y-6">
        <AlumnoHeader alumno={user.profile} />
        {/* Tabs de navegación */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              tab === "principal"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100"
            }`}
            onClick={() => setTab("principal")}
          >
            Principal
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              tab === "reportes"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100"
            }`}
            onClick={() => setTab("reportes")}
          >
            Reportes por Parcial
          </button>
        </div>
        {/* Contenido según tab */}
        {tab === "principal" ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Columna Principal */}
            <div className="lg:col-span-2 space-y-6">
              <EstadoAcademico alumnoId={user.profile.id} />
              <div className="grid md:grid-cols-2 gap-6">
                <IndicadoresCriticos alumno={user.profile} />
                <ProgresoCarrera alumnoId={user.profile.id} />
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
        ) : (
          <ReporteParcial alumnoId={user.profile.id} />
        )}
      </div>
    </DashboardLayout>
  );
}
