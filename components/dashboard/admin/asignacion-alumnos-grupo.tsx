"use client";

import { UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/auth-client";

interface Grupo {
  id: string;
  nombre: string;
  semestre: number;
}

interface Alumno {
  id: string;
  nombre_completo: string;
  matricula: string;
  semestre_actual: number;
  asignado: boolean;
}

export function AsignacionAlumnosGrupo() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>("");
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [conteoAlumnosPorGrupo, setConteoAlumnosPorGrupo] = useState<
    Record<string, number>
  >({});

  // Cargar grupos
  useEffect(() => {
    async function fetchGrupos() {
      setLoading(true);
      const supabase = createClient();
      const { data: gruposDb } = await supabase
        .from("grupos")
        .select("id, nombre, semestre")
        .order("semestre", { ascending: true });
      setGrupos(gruposDb ?? []);
      setLoading(false);
    }
    fetchGrupos();
  }, []);

  // Cargar conteo de alumnos por grupo
  useEffect(() => {
    async function fetchConteos() {
      const supabase = createClient();
      const { data: conteosDb } = await supabase
        .from("alumno_grupo")
        .select("grupo_id, alumno_id")
        .eq("activo", true);

      // Contar alumnos por grupo manualmente
      const conteos: Record<string, number> = {};
      (conteosDb ?? []).forEach((row: any) => {
        conteos[row.grupo_id] = (conteos[row.grupo_id] ?? 0) + 1;
      });
      setConteoAlumnosPorGrupo(conteos);
    }
    fetchConteos();
  }, [grupos]);

  // Cargar alumnos y su asignación al grupo seleccionado
  useEffect(() => {
    if (!grupoSeleccionado) {
      setAlumnos([]);
      return;
    }
    async function fetchAlumnos() {
      setLoading(true);
      const supabase = createClient();
      // Todos los alumnos
      const { data: alumnosDb } = await supabase
        .from("alumnos")
        .select("id, nombre_completo, matricula, semestre_actual");
      // Alumnos asignados al grupo
      const { data: asignadosDb } = await supabase
        .from("alumno_grupo")
        .select("alumno_id")
        .eq("grupo_id", grupoSeleccionado)
        .eq("activo", true);
      const asignadosSet = new Set(
        (asignadosDb ?? []).map((a: any) => a.alumno_id)
      );
      setAlumnos(
        (alumnosDb ?? []).map((al: any) => ({
          ...al,
          asignado: asignadosSet.has(al.id),
        }))
      );
      setLoading(false);
    }
    fetchAlumnos();
  }, [grupoSeleccionado]);

  // Cambiar asignación de alumnos
  const handleAsignar = async () => {
    setGuardando(true);
    const supabase = createClient();
    // Obtener alumnos seleccionados
    const seleccionados = alumnos.filter((a) => a.asignado).map((a) => a.id);

    // 1. Desactivar todas las asignaciones actuales del grupo
    await supabase
      .from("alumno_grupo")
      .update({ activo: false, fecha_fin: new Date().toISOString() })
      .eq("grupo_id", grupoSeleccionado)
      .eq("activo", true);

    // 2. Insertar nuevas asignaciones
    for (const alumnoId of seleccionados) {
      await supabase.from("alumno_grupo").insert([
        {
          alumno_id: alumnoId,
          grupo_id: grupoSeleccionado,
          activo: true,
          fecha_asignacion: new Date().toISOString(),
          semestre: `${new Date().getFullYear()}-${
            grupos.find((g) => g.id === grupoSeleccionado)?.semestre ?? 1
          }`,
        },
      ]);
    }
    setGuardando(false);
    // Refrescar alumnos
    setTimeout(() => window.location.reload(), 500);
  };

  // Cambiar estado de asignación en UI
  const toggleAlumno = (id: string, checked: boolean) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, asignado: checked } : a))
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Asignación de Alumnos a Grupos
          </CardTitle>
          <CardDescription>
            Selecciona un grupo y asigna los alumnos que pertenecerán a él.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Grupo</label>
              <Select
                value={grupoSeleccionado}
                onValueChange={setGrupoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {grupos.map((grupo) => (
                    <SelectItem key={grupo.id} value={grupo.id}>
                      {grupo.nombre} - {grupo.semestre}° Semestre
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({conteoAlumnosPorGrupo[grupo.id] ?? 0} alumnos)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAsignar}
              disabled={!grupoSeleccionado || guardando}
              className="w-full"
            >
              {guardando ? "Guardando..." : "Guardar Asignación"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {grupoSeleccionado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alumnos del Sistema
            </CardTitle>
            <CardDescription>
              Marca los alumnos que pertenecerán al grupo seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {Object.entries(
                  alumnos.reduce((acc, alumno) => {
                    const sem = alumno.semestre_actual;
                    if (!acc[sem]) acc[sem] = [];
                    acc[sem].push(alumno);
                    return acc;
                  }, {} as Record<number, Alumno[]>)
                ).map(([semestre, alumnosSemestre]) => (
                  <div key={semestre} className="mb-6">
                    <h4 className="font-semibold mb-2">{semestre}° Semestre</h4>
                    <div className="space-y-2">
                      {alumnosSemestre.map((alumno) => (
                        <div
                          key={alumno.id}
                          className={`flex items-center justify-between border rounded-lg px-4 py-2 ${
                            alumno.asignado ? "bg-primary/10" : ""
                          }`}
                        >
                          <div>
                            <span className="font-medium">
                              {alumno.nombre_completo}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              Matrícula: {alumno.matricula}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-2"
                            style={{ minWidth: 40 }}
                          >
                            {alumno.asignado && (
                              <Badge variant="default">Asignado</Badge>
                            )}
                            <Checkbox
                              checked={!!alumno.asignado}
                              onCheckedChange={(checked) =>
                                toggleAlumno(alumno.id, Boolean(checked))
                              }
                              className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 border-2 border-gray-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {alumnos.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No hay alumnos registrados
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
