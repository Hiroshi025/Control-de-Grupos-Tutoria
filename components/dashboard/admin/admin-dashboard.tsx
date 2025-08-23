"use client"

import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EstadisticasGenerales } from "./estadisticas-generales"
import { GestionUsuarios } from "./gestion-usuarios"
import { AsignacionTutores } from "./asignacion-tutores"
import { CargaMasiva } from "./carga-masiva"
import { GestionPlanEstudios } from "./gestion-plan-estudios"

export function AdminDashboard() {
  const { user } = useAuth()

  if (!user || user.userType !== "administrador") {
    return null
  }

  return (
    <DashboardLayout userType="administrador">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground">Bienvenido, {user.profile.nombre_completo}</p>
        </div>

        {/* Tabs de Navegación */}
        <Tabs defaultValue="estadisticas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="tutores">Tutores</TabsTrigger>
            <TabsTrigger value="carga">Carga Masiva</TabsTrigger>
            <TabsTrigger value="plan">Plan de Estudios</TabsTrigger>
          </TabsList>

          <TabsContent value="estadisticas">
            <EstadisticasGenerales />
          </TabsContent>

          <TabsContent value="usuarios">
            <GestionUsuarios />
          </TabsContent>

          <TabsContent value="tutores">
            <AsignacionTutores />
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
  )
}
