"use client"

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Clock, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ListaAlumnos } from "./lista-alumnos"
import { CalendarioSesiones } from "./calendario-sesiones"
import { RegistroSesiones } from "./registro-sesiones"
import { NuevaSesionDialog } from "./nueva-sesion-dialog"

interface GrupoDashboardProps {
  grupoId: string
}

interface GrupoInfo {
  id: string
  nombre: string
  semestre: number
  horario_tutoria?: string
  total_alumnos: number
  alumnos_riesgo: number
}

export function GrupoDashboard({ grupoId }: GrupoDashboardProps) {
  const [grupo, setGrupo] = useState<GrupoInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNuevaSesion, setShowNuevaSesion] = useState(false)

  useEffect(() => {
    // Simulamos la carga de información del grupo
    setTimeout(() => {
      setGrupo({
        id: grupoId,
        nombre: "IEM-1A",
        semestre: 1,
        horario_tutoria: "Lunes 14:00-15:00",
        total_alumnos: 28,
        alumnos_riesgo: 3,
      })
      setLoading(false)
    }, 1000)
  }, [grupoId])

  if (loading) {
    return (
      <DashboardLayout userType="profesor">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!grupo) {
    return (
      <DashboardLayout userType="profesor">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Grupo no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/profesor">Volver al Dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="profesor">
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/profesor">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>

        {/* Header del Grupo */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{grupo.nombre}</h1>
                  <p className="text-muted-foreground">{grupo.semestre}° Semestre • Ingeniería Electromecánica</p>
                  {grupo.horario_tutoria && (
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{grupo.horario_tutoria}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total de alumnos</p>
                  <p className="text-2xl font-bold">{grupo.total_alumnos}</p>
                </div>
                {grupo.alumnos_riesgo > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">En riesgo</p>
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      {grupo.alumnos_riesgo}
                    </Badge>
                  </div>
                )}
                <Button onClick={() => setShowNuevaSesion(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Contenido */}
        <Tabs defaultValue="alumnos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alumnos">Lista de Alumnos</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
            <TabsTrigger value="sesiones">Registro de Sesiones</TabsTrigger>
          </TabsList>

          <TabsContent value="alumnos">
            <ListaAlumnos grupoId={grupoId} />
          </TabsContent>

          <TabsContent value="calendario">
            <CalendarioSesiones grupoId={grupoId} />
          </TabsContent>

          <TabsContent value="sesiones">
            <RegistroSesiones grupoId={grupoId} />
          </TabsContent>
        </Tabs>

        {/* Dialog para Nueva Sesión */}
        <NuevaSesionDialog
          open={showNuevaSesion}
          onOpenChange={setShowNuevaSesion}
          grupoId={grupoId}
          grupoNombre={grupo.nombre}
        />
      </div>
    </DashboardLayout>
  )
}
