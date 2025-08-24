"use client";

import { AlertTriangle, Calendar, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/auth-client";

interface ListaAlumnosProps {
  grupoId: string;
}

interface Alumno {
  id: string;
  matricula: string;
  nombre_completo: string;
  semestre_actual: number;
  foto_credencial?: string;
  materias_en_recurso: number;
  materias_aprobadas: number;
  servicio_social_realizado: boolean;
  residencia_profesional_realizada: boolean;
  riesgo_nivel: "alto" | "medio" | "bajo";
  correo_institucional?: string;
  edad?: number;
  fecha_inscripcion?: string;
  materias_sin_cursar?: number;
  materias_en_especial?: number;
}

export function ListaAlumnos({ grupoId }: ListaAlumnosProps) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [agendarAlumnoId, setAgendarAlumnoId] = useState<string | null>(null);
  const [verPerfilAlumnoId, setVerPerfilAlumnoId] = useState<string | null>(
    null
  );
  const [perfilAlumno, setPerfilAlumno] = useState<Alumno | null>(null);
  const [agendarLoading, setAgendarLoading] = useState(false);
  const [agendarError, setAgendarError] = useState<string | null>(null);
  const [agendarSuccess, setAgendarSuccess] = useState(false);
  const [agendarObjetivos, setAgendarObjetivos] = useState("");
  const [agendarFecha, setAgendarFecha] = useState("");

  useEffect(() => {
    async function fetchAlumnos() {
      setLoading(true);
      try {
        const supabase = createClient();
        // Buscar alumnos activos en el grupo
        const { data: alumnoGrupo, error: errorGrupo } = await supabase
          .from("alumno_grupo")
          .select("alumno_id")
          .eq("grupo_id", grupoId)
          .eq("activo", true);
        if (!alumnoGrupo || errorGrupo) {
          setAlumnos([]);
          setLoading(false);
          return;
        }
        const alumnoIds = alumnoGrupo.map((ag: any) => ag.alumno_id);
        if (alumnoIds.length === 0) {
          setAlumnos([]);
          setLoading(false);
          return;
        }
        // Obtener datos de los alumnos
        const { data: alumnosData, error: errorAlumnos } = await supabase
          .from("alumnos")
          .select(
            "id, matricula, nombre_completo, semestre_actual, foto_credencial, materias_en_recurso, materias_aprobadas, servicio_social_realizado, residencia_profesional_realizada, correo_institucional, edad, fecha_inscripcion, materias_sin_cursar, materias_en_especial"
          )
          .in("id", alumnoIds);
        if (!alumnosData || errorAlumnos) {
          setAlumnos([]);
          setLoading(false);
          return;
        }
        // Calcular riesgo_nivel para cada alumno
        const alumnosConRiesgo = alumnosData.map((alumno: any) => {
          let riesgo_nivel: "alto" | "medio" | "bajo" = "bajo";
          if (alumno.materias_en_recurso >= 3) riesgo_nivel = "alto";
          else if (alumno.materias_en_recurso >= 1) riesgo_nivel = "medio";
          return { ...alumno, riesgo_nivel };
        });
        setAlumnos(alumnosConRiesgo);
      } catch (err) {
        setAlumnos([]);
      }
      setLoading(false);
    }
    fetchAlumnos();
  }, [grupoId]);

  // Modal: cargar datos completos del alumno
  useEffect(() => {
    async function fetchPerfilAlumno() {
      if (!verPerfilAlumnoId) {
        setPerfilAlumno(null);
        return;
      }
      const supabase = createClient();
      const { data: alumno, error } = await supabase
        .from("alumnos")
        .select("*")
        .eq("id", verPerfilAlumnoId)
        .single();
      if (alumno && !error) {
        setPerfilAlumno(alumno);
      } else {
        setPerfilAlumno(null);
      }
    }
    fetchPerfilAlumno();
  }, [verPerfilAlumnoId]);

  const alumnosFiltrados = alumnos.filter(
    (alumno) =>
      alumno.nombre_completo.toLowerCase().includes(filtro.toLowerCase()) ||
      alumno.matricula.includes(filtro)
  );

  const getRiesgoColor = (nivel: string) => {
    switch (nivel) {
      case "alto":
        return "destructive";
      case "medio":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRiesgoText = (alumno: Alumno) => {
    const riesgos = [];
    if (alumno.materias_en_recurso >= 3)
      riesgos.push("Múltiples materias en recurso");
    if (alumno.semestre_actual >= 8 && !alumno.servicio_social_realizado)
      riesgos.push("Servicio social pendiente");
    if (alumno.materias_aprobadas < alumno.semestre_actual * 4)
      riesgos.push("Bajo rendimiento académico");
    return riesgos.join(", ") || "Sin riesgos identificados";
  };

  // Handler para ver perfil
  const handleVerPerfil = (alumnoId: string) => {
    setVerPerfilAlumnoId(alumnoId);
  };

  // Handler para cerrar modal de perfil
  const handleCerrarPerfil = () => {
    setVerPerfilAlumnoId(null);
    setPerfilAlumno(null);
  };

  // Handler para agendar sesión
  const handleAgendar = (alumnoId: string) => {
    setAgendarAlumnoId(alumnoId);
    setAgendarObjetivos("");
    setAgendarFecha("");
    setAgendarError(null);
    setAgendarSuccess(false);
  };

  // Handler para guardar sesión agendada
  const handleGuardarAgendar = async () => {
    if (!agendarAlumnoId || !agendarFecha) {
      setAgendarError("Debes seleccionar una fecha.");
      return;
    }
    setAgendarLoading(true);
    setAgendarError(null);
    try {
      const supabase = createClient();
      // Obtener grupo y profesor
      const { data: grupo } = await supabase
        .from("grupos")
        .select("id, profesor_id")
        .eq("id", grupoId)
        .single();
      const profesorId = grupo?.profesor_id;
      // Insertar sesión individual
      const { error } = await supabase.from("sesiones_tutoria").insert([
        {
          profesor_id: profesorId,
          grupo_id: grupoId,
          alumno_id: agendarAlumnoId,
          tipo: "individual",
          fecha_sesion: agendarFecha,
          objetivos: agendarObjetivos,
        },
      ]);
      if (error) {
        setAgendarError("Error al agendar la sesión.");
      } else {
        setAgendarSuccess(true);
      }
    } catch (err) {
      setAgendarError("Error de conexión.");
    }
    setAgendarLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Lista de Alumnos</CardTitle>
            <CardDescription>
              Gestión y seguimiento de estudiantes del grupo
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o matrícula..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {alumnosFiltrados.map((alumno) => (
              <div
                key={alumno.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={alumno.foto_credencial || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {alumno.nombre_completo
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {alumno.nombre_completo}
                        </h3>
                        {alumno.riesgo_nivel !== "bajo" && (
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              alumno.riesgo_nivel === "alto"
                                ? "text-destructive"
                                : "text-yellow-500"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Matrícula: {alumno.matricula}</span>
                        <span>Semestre: {alumno.semestre_actual}°</span>
                        <span>
                          Materias en recurso: {alumno.materias_en_recurso}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getRiesgoText(alumno)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getRiesgoColor(alumno.riesgo_nivel)}>
                      {alumno.riesgo_nivel === "alto"
                        ? "Alto Riesgo"
                        : alumno.riesgo_nivel === "medio"
                        ? "Riesgo Medio"
                        : "Sin Riesgo"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerPerfil(alumno.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAgendar(alumno.id)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {alumnosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No se encontraron alumnos
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Modal Perfil Alumno */}
      <Dialog open={!!verPerfilAlumnoId} onOpenChange={handleCerrarPerfil}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perfil del Alumno</DialogTitle>
            <DialogDescription>
              Información completa del estudiante
            </DialogDescription>
          </DialogHeader>
          {perfilAlumno ? (
            <div className="space-y-2">
              <div className="flex items-center gap-4 mb-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={perfilAlumno.foto_credencial || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {perfilAlumno.nombre_completo
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">
                    {perfilAlumno.nombre_completo}
                  </h3>
                  <p className="text-muted-foreground">
                    {perfilAlumno.matricula}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Label>Correo institucional:</Label>
                  <div>{perfilAlumno.correo_institucional}</div>
                </div>
                <div>
                  <Label>Edad:</Label>
                  <div>{perfilAlumno.edad ?? "N/A"}</div>
                </div>
                <div>
                  <Label>Semestre actual:</Label>
                  <div>{perfilAlumno.semestre_actual}°</div>
                </div>
                <div>
                  <Label>Fecha inscripción:</Label>
                  <div>{perfilAlumno.fecha_inscripcion ?? "N/A"}</div>
                </div>
                <div>
                  <Label>Materias aprobadas:</Label>
                  <div>{perfilAlumno.materias_aprobadas}</div>
                </div>
                <div>
                  <Label>Materias en recurso:</Label>
                  <div>{perfilAlumno.materias_en_recurso}</div>
                </div>
                <div>
                  <Label>Materias en especial:</Label>
                  <div>{perfilAlumno.materias_en_especial ?? 0}</div>
                </div>
                <div>
                  <Label>Materias sin cursar:</Label>
                  <div>{perfilAlumno.materias_sin_cursar ?? 0}</div>
                </div>
                <div>
                  <Label>Servicio social:</Label>
                  <div>
                    {perfilAlumno.servicio_social_realizado
                      ? "Completado"
                      : "Pendiente"}
                  </div>
                </div>
                <div>
                  <Label>Residencia profesional:</Label>
                  <div>
                    {perfilAlumno.residencia_profesional_realizada
                      ? "Completada"
                      : "Pendiente"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se pudo cargar el perfil del alumno.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Agendar Sesión */}
      <Dialog
        open={!!agendarAlumnoId}
        onOpenChange={() => setAgendarAlumnoId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Sesión Individual</DialogTitle>
            <DialogDescription>
              Selecciona la fecha y objetivos para la sesión con el alumno.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fecha y hora de la sesión</Label>
              <Input
                type="datetime-local"
                value={agendarFecha}
                onChange={(e) => setAgendarFecha(e.target.value)}
              />
            </div>
            <div>
              <Label>Objetivos de la sesión</Label>
              <Textarea
                value={agendarObjetivos}
                onChange={(e) => setAgendarObjetivos(e.target.value)}
                placeholder="Describe los objetivos o temas a tratar..."
              />
            </div>
            {agendarError && (
              <div className="text-destructive text-sm">{agendarError}</div>
            )}
            {agendarSuccess && (
              <div className="text-green-600 text-sm">
                Sesión agendada correctamente.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setAgendarAlumnoId(null)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarAgendar}
                disabled={agendarLoading || !agendarFecha}
              >
                Agendar Sesión
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
