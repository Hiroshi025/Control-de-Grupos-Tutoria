"use client";

import { AlertTriangle, Calendar, Eye, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
}

export function ListaAlumnos({ grupoId }: ListaAlumnosProps) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

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
          .select("*")
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
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm">
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
    </Card>
  );
}
