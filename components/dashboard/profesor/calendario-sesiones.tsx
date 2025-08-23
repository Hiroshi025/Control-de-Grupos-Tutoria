"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, User, Plus } from "lucide-react"
import { useEffect, useState } from "react"

interface CalendarioSesionesProps {
  grupoId: string
}

interface SesionAgendada {
  id: string
  fecha_sesion: string
  tipo: "grupal" | "individual"
  objetivos?: string
  alumno_nombre?: string
  estado: "programada" | "completada" | "cancelada"
}

export function CalendarioSesiones({ grupoId }: CalendarioSesionesProps) {
  const [sesiones, setSesiones] = useState<SesionAgendada[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulamos la carga de sesiones agendadas
    setTimeout(() => {
      setSesiones([
        {
          id: "1",
          fecha_sesion: "2024-01-22T14:00:00Z",
          tipo: "grupal",
          objetivos: "Revisión de avance del segundo parcial",
          estado: "programada",
        },
        {
          id: "2",
          fecha_sesion: "2024-01-24T15:00:00Z",
          tipo: "individual",
          objetivos: "Seguimiento personalizado de materias en recurso",
          alumno_nombre: "Carlos Mendoza Ruiz",
          estado: "programada",
        },
        {
          id: "3",
          fecha_sesion: "2024-01-15T14:00:00Z",
          tipo: "grupal",
          objetivos: "Revisión de avance del primer parcial",
          estado: "completada",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [grupoId])

  const sesionesOrdenadas = sesiones.sort(
    (a, b) => new Date(a.fecha_sesion).getTime() - new Date(b.fecha_sesion).getTime(),
  )

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "programada":
        return "default"
      case "completada":
        return "secondary"
      case "cancelada":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "programada":
        return "Programada"
      case "completada":
        return "Completada"
      case "cancelada":
        return "Cancelada"
      default:
        return estado
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendario de Sesiones</CardTitle>
            <CardDescription>Sesiones programadas y completadas</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Programar Sesión
          </Button>
        </div>
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
        ) : sesiones.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay sesiones programadas</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Programar Primera Sesión
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sesionesOrdenadas.map((sesion) => (
              <div key={sesion.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {sesion.tipo === "grupal" ? (
                        <Users className="h-6 w-6 text-primary" />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          {sesion.tipo === "grupal" ? "Sesión Grupal" : "Sesión Individual"}
                        </h3>
                        <Badge variant={getEstadoColor(sesion.estado)}>{getEstadoText(sesion.estado)}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(sesion.fecha_sesion).toLocaleDateString("es-MX", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(sesion.fecha_sesion).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      {sesion.alumno_nombre && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Alumno:</strong> {sesion.alumno_nombre}
                        </p>
                      )}

                      {sesion.objetivos && <p className="text-sm">{sesion.objetivos}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sesion.estado === "programada" && (
                      <>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          Completar
                        </Button>
                      </>
                    )}
                    {sesion.estado === "completada" && (
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
