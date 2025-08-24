"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

import { AsignacionAlumnosGrupo } from "./asignacion-alumnos-grupo";
import { AsignacionTutores } from "./asignacion-tutores";
import { CargaMasiva } from "./carga-masiva";
import { EstadisticasGenerales } from "./estadisticas-generales";
import { GestionGrupos } from "./gestion-grupos";
import { GestionPlanEstudios } from "./gestion-plan-estudios";
import { GestionUsuarios } from "./gestion-usuarios";

export function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Leer el tab actual de la query string, por ejemplo ?tab=usuarios
  const tabActual = searchParams.get("tab") || "estadisticas";

  const handleTabChange = (tab: string) => {
    router.replace(`?tab=${tab}`);
  };

  if (!user || user.userType !== "administrador") {
    return null;
  }

  return (
    <DashboardLayout userType="administrador">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Bienvenido, {user.profile.nombre_completo}
          </p>
        </div>

        {/* Tabs de Navegación */}
        <Tabs
          value={tabActual}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="grupos">Grupos</TabsTrigger>
            <TabsTrigger value="tutores">Tutores</TabsTrigger>
            <TabsTrigger value="alumnos-grupo">Alumnos/Grupo</TabsTrigger>
            <TabsTrigger value="carga">Carga Masiva</TabsTrigger>
            <TabsTrigger value="plan">Plan de Estudios</TabsTrigger>
          </TabsList>

          <TabsContent value="estadisticas">
            <EstadisticasGenerales />
          </TabsContent>

          <TabsContent value="usuarios">
            <GestionUsuarios />
          </TabsContent>

          <TabsContent value="grupos">
            <GestionGrupos />
          </TabsContent>

          <TabsContent value="tutores">
            <AsignacionTutores />
          </TabsContent>

          <TabsContent value="alumnos-grupo">
            <AsignacionAlumnosGrupo />
          </TabsContent>

          <TabsContent value="carga">
            <CargaMasiva />
          </TabsContent>

          <TabsContent value="plan">
            <GestionPlanEstudios />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
