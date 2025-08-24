"use client";

import { Calendar, ChevronRight, Clock, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/auth-client";

interface Grupo {
  id: string;
  nombre: string;
  semestre: number;
  horario_tutoria?: string;
  total_alumnos: number;
  alumnos_riesgo: number;
}

export function ProfesorDashboard() {
  const { user } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Si agregas tabs, por ejemplo "estadisticas" y "grupos"
  const tabActual = searchParams.get("tab") || "estadisticas";
  const handleTabChange = (tab: string) => {
    router.replace(`?tab=${tab}`);
  };

  useEffect(() => {
    async function fetchGrupos() {
      setLoading(true);
      try {
        const supabase = createClient();
        // Buscar grupos activos asignados al profesor
        const { data: profesorGrupos, error: errorPG } = await supabase
          .from("profesor_grupo")
          .select("grupo_id")
          .eq("profesor_id", user?.profile.id)
          .eq("activo", true);
        if (!profesorGrupos || errorPG) {
          setGrupos([]);
          setLoading(false);
          return;
        }
        const grupoIds = profesorGrupos.map((pg: any) => pg.grupo_id);
        if (grupoIds.length === 0) {
          setGrupos([]);
          setLoading(false);
          return;
        }
        // Obtener datos de los grupos
        const { data: gruposData, error: errorGrupos } = await supabase
          .from("grupos")
          .select("*")
          .in("id", grupoIds);
        if (!gruposData || errorGrupos) {
          setGrupos([]);
          setLoading(false);
          return;
        }
        // Para cada grupo, obtener total de alumnos y alumnos en riesgo
        const gruposFinal: Grupo[] = [];
        for (const grupo of gruposData) {
          // Buscar alumnos activos en el grupo
          const { data: alumnoGrupo } = await supabase
            .from("alumno_grupo")
            .select("alumno_id")
            .eq("grupo_id", grupo.id)
            .eq("activo", true);
          const alumnoIds = alumnoGrupo
            ? alumnoGrupo.map((ag: any) => ag.alumno_id)
            : [];
          let total_alumnos = alumnoIds.length;
          let alumnos_riesgo = 0;
          if (alumnoIds.length > 0) {
            const { data: alumnos } = await supabase
              .from("alumnos")
              .select("id, materias_en_recurso")
              .in("id", alumnoIds);
            alumnos_riesgo = (alumnos || []).filter(
              (a: any) => a.materias_en_recurso >= 3
            ).length;
          }
          gruposFinal.push({
            id: grupo.id,
            nombre: grupo.nombre,
            semestre: grupo.semestre,
            horario_tutoria: grupo.horario_tutoria,
            total_alumnos,
            alumnos_riesgo,
          });
        }
        setGrupos(gruposFinal);
      } catch (err) {
        setGrupos([]);
      }
      setLoading(false);
    }
    if (user && user.userType === "profesor") {
      fetchGrupos();
    }
  }, [user]);

  if (!user || user.userType !== "profesor") {
    return null;
  }

  return (
    <DashboardLayout userType="profesor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard de Profesor
          </h1>
          <p className="text-muted-foreground">
            Bienvenido, {user.profile.nombre_completo}
          </p>
        </div>

        {/* Ejemplo de tabs */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              tabActual === "estadisticas"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100"
            }`}
            onClick={() => handleTabChange("estadisticas")}
          >
            Estadísticas
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              tabActual === "grupos"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100"
            }`}
            onClick={() => handleTabChange("grupos")}
          >
            Mis Grupos
          </button>
        </div>

        {/* Contenido según tab */}
        {tabActual === "estadisticas" ? (
          <>
            {/* Estadísticas Rápidas */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {grupos.reduce((sum, g) => sum + g.total_alumnos, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total de Alumnos
                      </p>
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
                      <p className="text-sm text-muted-foreground">
                        Grupos Asignados
                      </p>
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
                      <p className="text-2xl font-bold">
                        {grupos.reduce((sum, g) => sum + g.alumnos_riesgo, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Alumnos en Riesgo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Lista de Grupos */}
            <Card>
              <CardHeader>
                <CardTitle>Mis Grupos Tutorados</CardTitle>
                <CardDescription>
                  Semestre actual - Selecciona un grupo para gestionar
                </CardDescription>
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
                    <p className="text-muted-foreground">
                      No tienes grupos asignados en este semestre
                    </p>
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
                                <h3 className="font-semibold text-lg">
                                  {grupo.nombre}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {grupo.semestre}° Semestre • Ingeniería
                                  Electromecánica
                                </p>
                                {grupo.horario_tutoria && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {grupo.horario_tutoria}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {grupo.total_alumnos} alumnos
                                </p>
                                {grupo.alumnos_riesgo > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
