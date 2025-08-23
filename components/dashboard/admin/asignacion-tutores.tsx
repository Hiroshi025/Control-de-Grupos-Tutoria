"use client";

import { ArrowRight, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  total_alumnos: number;
  tutor_asignado?: {
    id: string;
    nombre: string;
    correo: string;
  };
}

interface Profesor {
  id: string;
  nombre_completo: string;
  correo_institucional: string;
  grupos_actuales: number;
}

export function AsignacionTutores() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState(false);

  // Cargar datos reales de la DB
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      // 1. Obtener grupos y contar alumnos
      const { data: gruposDb } = await supabase
        .from("grupos")
        .select("id, nombre, semestre")
        .order("semestre", { ascending: true });

      // 2. Obtener alumnos por grupo
      let gruposConAlumnos: Grupo[] = [];
      if (gruposDb) {
        for (const grupo of gruposDb) {
          // Contar alumnos en el grupo
          const { count: total_alumnos } = await supabase
            .from("alumno_grupo")
            .select("id", { count: "exact", head: true })
            .eq("grupo_id", grupo.id)
            .eq("activo", true);

          // Buscar tutor asignado (profesor_grupo activo)
          const { data: rel } = await supabase
            .from("profesor_grupo")
            .select("profesor_id, activo, fecha_fin")
            .eq("grupo_id", grupo.id)
            .eq("activo", true)
            .limit(1)
            .single();

          let tutor_asignado: Grupo["tutor_asignado"] = undefined;
          if (rel && rel.profesor_id) {
            // Obtener datos del profesor
            const { data: prof } = await supabase
              .from("profesores")
              .select("id, nombre_completo, correo_institucional")
              .eq("id", rel.profesor_id)
              .single();
            if (prof) {
              tutor_asignado = {
                id: prof.id,
                nombre: prof.nombre_completo,
                correo: prof.correo_institucional,
              };
            }
          }

          gruposConAlumnos.push({
            id: grupo.id,
            nombre: grupo.nombre,
            semestre: grupo.semestre,
            total_alumnos: total_alumnos ?? 0,
            tutor_asignado,
          });
        }
      }

      setGrupos(gruposConAlumnos);

      // 3. Obtener profesores y contar grupos activos
      const { data: profesoresDb } = await supabase
        .from("profesores")
        .select("id, nombre_completo, correo_institucional");

      let profesoresConGrupos: Profesor[] = [];
      if (profesoresDb) {
        for (const prof of profesoresDb) {
          const { count: grupos_actuales } = await supabase
            .from("profesor_grupo")
            .select("id", { count: "exact", head: true })
            .eq("profesor_id", prof.id)
            .eq("activo", true);
          profesoresConGrupos.push({
            id: prof.id,
            nombre_completo: prof.nombre_completo,
            correo_institucional: prof.correo_institucional,
            grupos_actuales: grupos_actuales ?? 0,
          });
        }
      }

      setProfesores(profesoresConGrupos);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Asignar tutor real en la DB
  const handleAsignarTutor = async () => {
    if (!profesorSeleccionado || !grupoSeleccionado) return;
    setAsignando(true);
    const supabase = createClient();

    // 1. Verificar si ya existe relación activa
    const { data: relExistente } = await supabase
      .from("profesor_grupo")
      .select("id")
      .eq("grupo_id", grupoSeleccionado)
      .eq("activo", true)
      .limit(1)
      .single();

    if (relExistente && relExistente.id) {
      // Si existe, desactivar la relación anterior
      await supabase
        .from("profesor_grupo")
        .update({ activo: false, fecha_fin: new Date().toISOString() })
        .eq("id", relExistente.id);
    }

    // 2. Crear nueva relación profesor-grupo activa
    await supabase.from("profesor_grupo").insert([
      {
        profesor_id: profesorSeleccionado,
        grupo_id: grupoSeleccionado,
        semestre: `${new Date().getFullYear()}-${
          new Date().getMonth() < 6 ? "1" : "2"
        }`,
        activo: true,
        fecha_asignacion: new Date().toISOString(),
      },
    ]);

    // 3. Actualizar datos locales
    // Recargar datos
    const { data: gruposDb } = await supabase
      .from("grupos")
      .select("id, nombre, semestre")
      .order("semestre", { ascending: true });

    let gruposConAlumnos: Grupo[] = [];
    if (gruposDb) {
      for (const grupo of gruposDb) {
        const { count: total_alumnos } = await supabase
          .from("alumno_grupo")
          .select("id", { count: "exact", head: true })
          .eq("grupo_id", grupo.id)
          .eq("activo", true);

        const { data: rel } = await supabase
          .from("profesor_grupo")
          .select("profesor_id, activo, fecha_fin")
          .eq("grupo_id", grupo.id)
          .eq("activo", true)
          .limit(1)
          .single();

        let tutor_asignado: Grupo["tutor_asignado"] = undefined;
        if (rel && rel.profesor_id) {
          const { data: prof } = await supabase
            .from("profesores")
            .select("id, nombre_completo, correo_institucional")
            .eq("id", rel.profesor_id)
            .single();
          if (prof) {
            tutor_asignado = {
              id: prof.id,
              nombre: prof.nombre_completo,
              correo: prof.correo_institucional,
            };
          }
        }

        gruposConAlumnos.push({
          id: grupo.id,
          nombre: grupo.nombre,
          semestre: grupo.semestre,
          total_alumnos: total_alumnos ?? 0,
          tutor_asignado,
        });
      }
    }
    setGrupos(gruposConAlumnos);

    // Actualizar profesores
    const { data: profesoresDb } = await supabase
      .from("profesores")
      .select("id, nombre_completo, correo_institucional");

    let profesoresConGrupos: Profesor[] = [];
    if (profesoresDb) {
      for (const prof of profesoresDb) {
        const { count: grupos_actuales } = await supabase
          .from("profesor_grupo")
          .select("id", { count: "exact", head: true })
          .eq("profesor_id", prof.id)
          .eq("activo", true);
        profesoresConGrupos.push({
          id: prof.id,
          nombre_completo: prof.nombre_completo,
          correo_institucional: prof.correo_institucional,
          grupos_actuales: grupos_actuales ?? 0,
        });
      }
    }
    setProfesores(profesoresConGrupos);

    setAsignando(false);
    setProfesorSeleccionado("");
    setGrupoSeleccionado("");
  };

  const gruposSinTutor = grupos.filter((grupo) => !grupo.tutor_asignado);
  const gruposConTutor = grupos.filter((grupo) => grupo.tutor_asignado);

  return (
    <div className="space-y-6">
      {/* Asignación Rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Asignación de Tutores
          </CardTitle>
          <CardDescription>
            Asigna profesores como tutores de grupos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Profesor</label>
              <Select
                value={profesorSeleccionado}
                onValueChange={setProfesorSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  {profesores.map((profesor) => (
                    <SelectItem key={profesor.id} value={profesor.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{profesor.nombre_completo}</span>
                        <Badge variant="outline" className="ml-2">
                          {profesor.grupos_actuales} grupos
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Grupo</label>
              <Select
                value={grupoSeleccionado}
                onValueChange={setGrupoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {gruposSinTutor.map((grupo) => (
                    <SelectItem key={grupo.id} value={grupo.id}>
                      {grupo.nombre} - {grupo.semestre}° Semestre (
                      {grupo.total_alumnos} alumnos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAsignarTutor}
              disabled={
                !profesorSeleccionado || !grupoSeleccionado || asignando
              }
              className="w-full"
            >
              {asignando ? "Asignando..." : "Asignar Tutor"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Grupos Sin Tutor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              Grupos Sin Tutor Asignado
            </CardTitle>
            <CardDescription>
              Grupos que requieren asignación de tutor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : gruposSinTutor.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Todos los grupos tienen tutor asignado
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {gruposSinTutor.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="border border-destructive/20 rounded-lg p-4 bg-destructive/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{grupo.nombre}</h3>
                        <p className="text-sm text-muted-foreground">
                          {grupo.semestre}° Semestre • {grupo.total_alumnos}{" "}
                          alumnos
                        </p>
                      </div>
                      <Badge variant="destructive">Sin Tutor</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grupos Con Tutor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">
              Grupos Con Tutor Asignado
            </CardTitle>
            <CardDescription>
              Grupos que ya tienen tutor asignado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {gruposConTutor.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="border border-primary/20 rounded-lg p-4 bg-primary/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>
                            {grupo.tutor_asignado?.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{grupo.nombre}</h3>
                          <p className="text-sm text-muted-foreground">
                            {grupo.semestre}° Semestre • {grupo.total_alumnos}{" "}
                            alumnos
                          </p>
                          <p className="text-sm font-medium text-primary">
                            {grupo.tutor_asignado?.nombre}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">Asignado</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
