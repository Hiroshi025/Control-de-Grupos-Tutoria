"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, User, Search } from "lucide-react"
import { useEffect, useState } from "react"

interface RegistroSesionesProps {
  grupoId: string
}

interface SesionRegistrada {
  id: string
  fecha_sesion: string
  tipo: "grupal" | "individual"
  objetivos?: string
  temas_tratados?: string
  acuerdos_compromisos?: string
  alumno_nombre?: string
}

export function RegistroSesiones({ grupoId }: RegistroSesionesProps) {
  const [sesiones, setSesiones] = useState<SesionRegistrada[]>([])
  const [filtro, setFiltro] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulamos la carga del historial de sesiones
    setTimeout(() => {
      setSesiones([
        {
          id: "1",
          fecha_sesion: "2024-01-15T14:00:00Z",
          tipo: "grupal",
          objetivos: "Revisión de avance académico del primer parcial",
          temas_tratados: "Análisis de calificaciones, identificación de materias con mayor dificultad",
          acuerdos_compromisos: "Implementar sesiones de estudio grupales, mejorar asistencia",
        },
        {
          id: "2",
          fecha_sesion: "2024-01-10T15:00:00Z",
          tipo: "individual",
          objetivos: "Seguimiento personalizado de materias en recurso",
          temas_tratados: "Plan de recuperación para Cálculo Diferencial y Física I",
          acuerdos_compromisos: "Presentar avances semanales, asistir a asesorías",
          alumno_nombre: "Carlos Mendoza Ruiz",
        },
        {
          id: "3",
          fecha_sesion: "2024-01-08T14:00:00Z",
          tipo: "grupal",
          objetivos: "Orientación sobre servicios institucionales",
          temas_tratados: "Presentación de servicios de biblioteca, laboratorios y becas",
          acuerdos_compromisos: "Registrarse en servicios de apoyo académico",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [grupoId])

  const sesionesFiltradas = sesiones.filter((sesion) => {
    const coincideFiltro =
      sesion.objetivos?.toLowerCase().includes(filtro.toLowerCase()) ||
      sesion.temas_tratados?.toLowerCase().includes(filtro.toLowerCase()) ||
      sesion.alumno_nombre?.toLowerCase().includes(filtro.toLowerCase())

    const coincideTipo = tipoFiltro === "todos" || sesion.tipo === tipoFiltro

    return coincideFiltro && coincideTipo
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Registro de Sesiones</CardTitle>
            <CardDescription>Historial de sesiones de tutoría realizadas</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en sesiones..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="grupal">Grupales</SelectItem>
                <SelectItem value="individual">Individuales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : sesionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron sesiones</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sesionesFiltradas.map((sesion) => (
              <div key={sesion.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {sesion.tipo === "grupal" ? (
                        <Users className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {sesion.tipo === "grupal" ? "Sesión Grupal" : "Sesión Individual"}
                        </h3>
                        <Badge variant={sesion.tipo === "grupal" ? "secondary" : "outline"}>{sesion.tipo}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(sesion.fecha_sesion).toLocaleDateString("es-MX", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Generar Reporte
                  </Button>
                </div>

                {sesion.alumno_nombre && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <strong>Alumno:</strong> {sesion.alumno_nombre}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {sesion.objetivos && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Objetivos</h4>
                      <p className="text-sm">{sesion.objetivos}</p>
                    </div>
                  )}

                  {sesion.temas_tratados && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Temas Tratados</h4>
                      <p className="text-sm">{sesion.temas_tratados}</p>
                    </div>
                  )}

                  {sesion.acuerdos_compromisos && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Acuerdos y Compromisos</h4>
                      <p className="text-sm">{sesion.acuerdos_compromisos}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
