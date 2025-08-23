"use client";

import { useState } from "react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";

import { AccionesRapidas } from "./acciones-rapidas";
import { AlumnoHeader } from "./alumno-header";
import { EstadoAcademico } from "./estado-academico";
import { IndicadoresCriticos } from "./indicadores-criticos";
import { InfoTutor } from "./info-tutor";
import { MisTutorias } from "./mis-tutorias";
import { ProgresoCarrera } from "./progreso-carrera";
import { ReporteAcademico } from "./reporte-academico";
import { ReporteParcial } from "./reporte-parcial";

export function AlumnoDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"principal" | "reportes">("principal");

  if (!user || user.userType !== "alumno") {
    return null;
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
