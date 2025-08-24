"use client";

import { Calendar, Clock, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/auth-client";

interface NuevaSesionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupoId: string;
  grupoNombre: string;
}

export function NuevaSesionDialog({
  open,
  onOpenChange,
  grupoId,
  grupoNombre,
}: NuevaSesionDialogProps) {
  const [tipo, setTipo] = useState<"grupal" | "individual">("grupal");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [temasTratar, setTemasTratar] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");
  const [materiasReprobadasParcial, setMateriasReprobadasParcial] = useState<
    string[]
  >([]);
  const [materiasReprobadasFinal, setMateriasReprobadasFinal] = useState<
    string[]
  >([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [alumnos, setAlumnos] = useState<
    { id: string; nombre: string; matricula: string }[]
  >([]);
  const [materias, setMaterias] = useState<
    { id: string; nombre: string; clave: string }[]
  >([]);

  useEffect(() => {
    async function fetchAlumnosMaterias() {
      const supabase = createClient();
      // Alumnos activos en el grupo
      const { data: alumnoGrupo } = await supabase
        .from("alumno_grupo")
        .select("alumno_id")
        .eq("grupo_id", grupoId)
        .eq("activo", true);
      const alumnoIds = alumnoGrupo?.map((ag: any) => ag.alumno_id) ?? [];
      if (alumnoIds.length > 0) {
        const { data: alumnosData } = await supabase
          .from("alumnos")
          .select("id, nombre_completo, matricula")
          .in("id", alumnoIds);
        setAlumnos(
          (alumnosData ?? []).map((a: any) => ({
            id: a.id,
            nombre: a.nombre_completo,
            matricula: a.matricula,
          }))
        );
      } else {
        setAlumnos([]);
      }
      // Materias del grupo (por carrera y semestre)
      const { data: grupo } = await supabase
        .from("grupos")
        .select("carrera_id, semestre")
        .eq("id", grupoId)
        .single();
      if (grupo) {
        const { data: materiasData } = await supabase
          .from("materias")
          .select("id, nombre, clave")
          .eq("carrera_id", grupo.carrera_id)
          .eq("semestre", grupo.semestre);
        setMaterias(materiasData ?? []);
      } else {
        setMaterias([]);
      }
    }
    if (open) fetchAlumnosMaterias();
  }, [open, grupoId]);

  const handleMateriaChange = (
    materiaId: string,
    checked: boolean,
    tipoReporte: "parcial" | "final"
  ) => {
    if (tipoReporte === "parcial") {
      setMateriasReprobadasParcial(
        checked
          ? [...materiasReprobadasParcial, materiaId]
          : materiasReprobadasParcial.filter((id) => id !== materiaId)
      );
    } else {
      setMateriasReprobadasFinal(
        checked
          ? [...materiasReprobadasFinal, materiaId]
          : materiasReprobadasFinal.filter((id) => id !== materiaId)
      );
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    setSuccess(false);
    try {
      const supabase = createClient();
      // Obtener profesor_id del grupo
      const { data: grupo } = await supabase
        .from("grupos")
        .select("profesor_id")
        .eq("id", grupoId)
        .single();
      const profesorId = grupo?.profesor_id;

      // Construir fecha y hora en formato ISO
      let fechaSesion = "";
      if (fecha && hora) {
        fechaSesion = new Date(`${fecha}T${hora}`).toISOString();
      } else if (fecha) {
        fechaSesion = new Date(fecha).toISOString();
      }

      // Insertar sesión en la DB
      const { error: sesionError } = await supabase
        .from("sesiones_tutoria")
        .insert([
          {
            profesor_id: profesorId,
            grupo_id: grupoId,
            alumno_id: tipo === "individual" ? alumnoSeleccionado : null,
            tipo,
            fecha_sesion: fechaSesion,
            objetivos,
            temas_tratados: temasTratar,
            materias_reprobadas_parcial:
              materiasReprobadasParcial.length > 0
                ? materiasReprobadasParcial
                : null,
            materias_a_recurso_final:
              materiasReprobadasFinal.length > 0
                ? materiasReprobadasFinal
                : null,
          },
        ]);
      if (sesionError) {
        setError("Error al guardar la sesión.");
        setGuardando(false);
        return;
      }
      setSuccess(true);
      // Reset form
      setTipo("grupal");
      setFecha("");
      setHora("");
      setObjetivos("");
      setTemasTratar("");
      setAlumnoSeleccionado("");
      setMateriasReprobadasParcial([]);
      setMateriasReprobadasFinal([]);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 1200);
    } catch (err) {
      setError("Error de conexión.");
    }
    setGuardando(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Sesión de Tutoría</DialogTitle>
          <DialogDescription>
            Registra una nueva sesión para el grupo {grupoNombre}
          </DialogDescription>
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
                  <Select
                    value={tipo}
                    onValueChange={(value: "grupal" | "individual") =>
                      setTipo(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grupal">Sesión Grupal</SelectItem>
                      <SelectItem value="individual">
                        Sesión Individual
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipo === "individual" && (
                  <div className="space-y-2">
                    <Label>Alumno</Label>
                    <Select
                      value={alumnoSeleccionado}
                      onValueChange={setAlumnoSeleccionado}
                    >
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
                    <Input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hora</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                      className="pl-10"
                    />
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
              <CardDescription>
                Registra materias reprobadas o en riesgo (opcional)
              </CardDescription>
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
                        <div
                          key={materia.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`parcial-${materia.id}`}
                            checked={materiasReprobadasParcial.includes(
                              materia.id
                            )}
                            onCheckedChange={(checked) =>
                              handleMateriaChange(
                                materia.id,
                                checked as boolean,
                                "parcial"
                              )
                            }
                          />
                          <label
                            htmlFor={`parcial-${materia.id}`}
                            className="text-sm cursor-pointer"
                          >
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
                        <div
                          key={materia.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`final-${materia.id}`}
                            checked={materiasReprobadasFinal.includes(
                              materia.id
                            )}
                            onCheckedChange={(checked) =>
                              handleMateriaChange(
                                materia.id,
                                checked as boolean,
                                "final"
                              )
                            }
                          />
                          <label
                            htmlFor={`final-${materia.id}`}
                            className="text-sm cursor-pointer"
                          >
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

          {/* Mensajes de estado */}
          {error && <div className="text-destructive text-sm">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm">
              Sesión registrada correctamente.
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={
                guardando ||
                !fecha ||
                !hora ||
                (tipo === "individual" && !alumnoSeleccionado)
              }
            >
              {guardando ? "Guardando..." : "Guardar Sesión"}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
