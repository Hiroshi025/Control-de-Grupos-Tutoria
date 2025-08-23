"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Save } from "lucide-react"
import { useState } from "react"

interface NuevaSesionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grupoId: string
  grupoNombre: string
}

export function NuevaSesionDialog({ open, onOpenChange, grupoId, grupoNombre }: NuevaSesionDialogProps) {
  const [tipo, setTipo] = useState<"grupal" | "individual">("grupal")
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [objetivos, setObjetivos] = useState("")
  const [temasTratar, setTemasTratar] = useState("")
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("")
  const [materiasReprobadas, setMateriasReprobadas] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)

  // Datos de ejemplo - en implementación real vendrían de la API
  const alumnos = [
    { id: "1", nombre: "Ana García López", matricula: "20240001" },
    { id: "2", nombre: "Carlos Mendoza Ruiz", matricula: "20240002" },
    { id: "3", nombre: "María Elena Sánchez", matricula: "20240003" },
  ]

  const materias = [
    { id: "1", nombre: "Cálculo Diferencial", clave: "ACF-0901" },
    { id: "2", nombre: "Física I", clave: "AEF-1015" },
    { id: "3", nombre: "Química", clave: "AEF-1052" },
    { id: "4", nombre: "Dibujo Técnico", clave: "AEC-1008" },
  ]

  const handleMateriaChange = (materiaId: string, checked: boolean) => {
    if (checked) {
      setMateriasReprobadas([...materiasReprobadas, materiaId])
    } else {
      setMateriasReprobadas(materiasReprobadas.filter((id) => id !== materiaId))
    }
  }

  const handleGuardar = async () => {
    setGuardando(true)

    // Simular guardado
    setTimeout(() => {
      setGuardando(false)
      onOpenChange(false)
      // Reset form
      setTipo("grupal")
      setFecha("")
      setHora("")
      setObjetivos("")
      setTemasTratar("")
      setAlumnoSeleccionado("")
      setMateriasReprobadas([])
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Sesión de Tutoría</DialogTitle>
          <DialogDescription>Registra una nueva sesión para el grupo {grupoNombre}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Sesión</Label>
                  <Select value={tipo} onValueChange={(value: "grupal" | "individual") => setTipo(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grupal">Sesión Grupal</SelectItem>
                      <SelectItem value="individual">Sesión Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipo === "individual" && (
                  <div className="space-y-2">
                    <Label>Alumno</Label>
                    <Select value={alumnoSeleccionado} onValueChange={setAlumnoSeleccionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un alumno" />
                      </SelectTrigger>
                      <SelectContent>
                        {alumnos.map((alumno) => (
                          <SelectItem key={alumno.id} value={alumno.id}>
                            {alumno.nombre} ({alumno.matricula})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hora</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenido de la Sesión */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contenido de la Sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Objetivos</Label>
                <Textarea
                  placeholder="Describe los objetivos de la sesión..."
                  value={objetivos}
                  onChange={(e) => setObjetivos(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Temas a Tratar</Label>
                <Textarea
                  placeholder="Lista los temas que se abordarán en la sesión..."
                  value={temasTratar}
                  onChange={(e) => setTemasTratar(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reporte Académico */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reporte Académico</CardTitle>
              <CardDescription>Registra materias reprobadas o en riesgo (opcional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="parcial" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="parcial">Reporte Parcial</TabsTrigger>
                  <TabsTrigger value="final">Reporte Final</TabsTrigger>
                </TabsList>

                <TabsContent value="parcial" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Materias Reprobadas en Parcial</Label>
                    <div className="grid md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {materias.map((materia) => (
                        <div key={materia.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`parcial-${materia.id}`}
                            checked={materiasReprobadas.includes(materia.id)}
                            onCheckedChange={(checked) => handleMateriaChange(materia.id, checked as boolean)}
                          />
                          <label htmlFor={`parcial-${materia.id}`} className="text-sm cursor-pointer">
                            {materia.nombre} ({materia.clave})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="final" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Materias que van a Recurso</Label>
                    <div className="grid md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {materias.map((materia) => (
                        <div key={materia.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`final-${materia.id}`}
                            checked={materiasReprobadas.includes(materia.id)}
                            onCheckedChange={(checked) => handleMateriaChange(materia.id, checked as boolean)}
                          />
                          <label htmlFor={`final-${materia.id}`} className="text-sm cursor-pointer">
                            {materia.nombre} ({materia.clave})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} disabled={guardando || !fecha || !hora}>
              {guardando ? "Guardando..." : "Guardar Sesión"}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
