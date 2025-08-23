"use client"

import { AlertTriangle, Send } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { notificationService } from "@/lib/notifications-client";

interface ReporteAcademicoProps {
  alumnoId: string
  tutorId?: string
}

export function ReporteAcademico({ alumnoId, tutorId }: ReporteAcademicoProps) {
  const { user } = useAuth()
  const [parcial, setParcial] = useState<string>("")
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const materias = [
    { id: "1", nombre: "Cálculo Diferencial", clave: "ACF-0901" },
    { id: "2", nombre: "Física I", clave: "AEF-1015" },
    { id: "3", nombre: "Química", clave: "AEF-1052" },
    { id: "4", nombre: "Dibujo Técnico", clave: "AEC-1008" },
    { id: "5", nombre: "Programación", clave: "AED-1285" },
  ]

  const handleMateriaChange = (materiaId: string, checked: boolean) => {
    if (checked) {
      setMateriasSeleccionadas([...materiasSeleccionadas, materiaId])
    } else {
      setMateriasSeleccionadas(materiasSeleccionadas.filter((id) => id !== materiaId))
    }
  }

  const handleEnviarReporte = async () => {
    if (!parcial || materiasSeleccionadas.length === 0) return

    setEnviando(true)

    try {
      const materiasReportadas = materias
        .filter((materia) => materiasSeleccionadas.includes(materia.id))
        .map((materia) => materia.nombre)

      if (tutorId && user?.id) {
        await notificationService.notificarReporteAcademico(
          user.id,
          tutorId,
          materiasReportadas,
          parcial === "final" ? "Examen Final" : `${parcial}° Parcial`,
        )
      }

      setEnviado(true)
      setEnviando(false)
      setParcial("")
      setMateriasSeleccionadas([])

      setTimeout(() => setEnviado(false), 3000)
    } catch (error) {
      console.error("Error enviando reporte:", error)
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reporte Académico</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Send className="h-4 w-4" />
            <AlertDescription>Reporte enviado exitosamente. Tu tutor ha sido notificado.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte Académico</CardTitle>
        <CardDescription>Reporta materias reprobadas a tu tutor</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Reporta proactivamente las materias que hayas reprobado para recibir apoyo oportuno de tu tutor.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium">Parcial</label>
          <Select value={parcial} onValueChange={setParcial}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el parcial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Primer Parcial</SelectItem>
              <SelectItem value="2">Segundo Parcial</SelectItem>
              <SelectItem value="3">Tercer Parcial</SelectItem>
              <SelectItem value="final">Examen Final</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Materias Reprobadas</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {materias.map((materia) => (
              <div key={materia.id} className="flex items-center space-x-2">
                <Checkbox
                  id={materia.id}
                  checked={materiasSeleccionadas.includes(materia.id)}
                  onCheckedChange={(checked) => handleMateriaChange(materia.id, checked as boolean)}
                />
                <label htmlFor={materia.id} className="text-sm cursor-pointer flex-1">
                  <span className="font-medium">{materia.nombre}</span>
                  <span className="text-muted-foreground ml-2">({materia.clave})</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleEnviarReporte}
          disabled={!parcial || materiasSeleccionadas.length === 0 || enviando}
          className="w-full"
        >
          {enviando ? "Enviando..." : "Enviar Reporte"}
          <Send className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
