"use client"

import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Grupo {
  id: string
  nombre: string
  semestre: number
  horario_tutoria?: string
  total_alumnos: number
  alumnos_riesgo: number
}

export function ProfesorDashboard() {
  const { user } = useAuth()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulamos la carga de grupos del profesor
    setTimeout(() => {
      setGrupos([
        {
          id: "1",
          nombre: "IEM-1A",
          semestre: 1,
          horario_tutoria: "Lunes 14:00-15:00",
          total_alumnos: 28,
          alumnos_riesgo: 3,
        },
        {
          id: "2",
          nombre: "IEM-3A",
          semestre: 3,
          horario_tutoria: "Miércoles 15:00-16:00",
          total_alumnos: 25,
          alumnos_riesgo: 5,
        },
        {
          id: "3",
          nombre: "IEM-5A",
          semestre: 5,
          horario_tutoria: "Viernes 16:00-17:00",
          total_alumnos: 22,
          alumnos_riesgo: 2,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (!user || user.userType !== "profesor") {
    return null
  }

  return (
    <DashboardLayout userType="profesor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Profesor</h1>
          <p className="text-muted-foreground">Bienvenido, {user.profile.nombre_completo}</p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{grupos.reduce((sum, g) => sum + g.total_alumnos, 0)}</p>
                  <p className="text-sm text-muted-foreground">Total de Alumnos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{grupos.length}</p>
                  <p className="text-sm text-muted-foreground">Grupos Asignados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{grupos.reduce((sum, g) => sum + g.alumnos_riesgo, 0)}</p>
                  <p className="text-sm text-muted-foreground">Alumnos en Riesgo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Grupos */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Grupos Tutorados</CardTitle>
            <CardDescription>Semestre actual - Selecciona un grupo para gestionar</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : grupos.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes grupos asignados en este semestre</p>
              </div>
            ) : (
              <div className="space-y-4">
                {grupos.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Link href={`/dashboard/profesor/grupo/${grupo.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{grupo.nombre}</h3>
                            <p className="text-sm text-muted-foreground">
                              {grupo.semestre}° Semestre • Ingeniería Electromecánica
                            </p>
                            {grupo.horario_tutoria && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{grupo.horario_tutoria}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{grupo.total_alumnos} alumnos</p>
                            {grupo.alumnos_riesgo > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {grupo.alumnos_riesgo} en riesgo
                              </Badge>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
