"use client";

import { Calendar, Clock, Plus, User, Users } from "lucide-react";
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
import { createClient } from "@/lib/auth-client";

interface CalendarioSesionesProps {
  grupoId: string;
}

interface SesionAgendada {
  id: string;
  fecha_sesion: string;
  tipo: "grupal" | "individual";
  objetivos?: string;
  alumno_nombre?: string;
  estado: "programada" | "completada" | "cancelada";
}

export function CalendarioSesiones({ grupoId }: CalendarioSesionesProps) {
  const [sesiones, setSesiones] = useState<SesionAgendada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSesiones() {
      setLoading(true);
      try {
        const supabase = createClient();
        // Obtener sesiones de tutoría del grupo
        const { data: sesionesData, error } = await supabase
          .from("sesiones_tutoria")
          .select("id, fecha_sesion, tipo, objetivos, alumno_id, estado")
          .eq("grupo_id", grupoId)
          .order("fecha_sesion", { ascending: true });

        if (!sesionesData || error) {
          setSesiones([]);
          setLoading(false);
          return;
        }

        // Obtener nombres de alumnos para sesiones individuales
        const alumnoIds = sesionesData
          .filter((s: any) => s.tipo === "individual" && s.alumno_id)
          .map((s: any) => s.alumno_id);
        let alumnosMap: Record<string, string> = {};
        if (alumnoIds.length > 0) {
          const { data: alumnos } = await supabase
            .from("alumnos")
            .select("id, nombre_completo")
            .in("id", alumnoIds);
          alumnosMap = (alumnos || []).reduce((acc: any, alumno: any) => {
            acc[alumno.id] = alumno.nombre_completo;
            return acc;
          }, {});
        }

        setSesiones(
          sesionesData.map((sesion: any) => ({
            id: sesion.id,
            fecha_sesion: sesion.fecha_sesion,
            tipo: sesion.tipo,
            objetivos: sesion.objetivos,
            alumno_nombre:
              sesion.tipo === "individual" && sesion.alumno_id
                ? alumnosMap[sesion.alumno_id]
                : undefined,
            estado: sesion.estado || "programada",
          }))
        );
      } catch (err) {
        setSesiones([]);
      }
      setLoading(false);
    }
    fetchSesiones();
  }, [grupoId]);

  const sesionesOrdenadas = sesiones.sort(
    (a, b) =>
      new Date(a.fecha_sesion).getTime() - new Date(b.fecha_sesion).getTime()
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "programada":
        return "default";
      case "completada":
        return "secondary";
      case "cancelada":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "programada":
        return "Programada";
      case "completada":
        return "Completada";
      case "cancelada":
        return "Cancelada";
      default:
        return estado;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendario de Sesiones</CardTitle>
            <CardDescription>
              Sesiones programadas y completadas
            </CardDescription>
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
              <div
                key={sesion.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
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
                          {sesion.tipo === "grupal"
                            ? "Sesión Grupal"
                            : "Sesión Individual"}
                        </h3>
                        <Badge variant={getEstadoColor(sesion.estado)}>
                          {getEstadoText(sesion.estado)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(sesion.fecha_sesion).toLocaleDateString(
                            "es-MX",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(sesion.fecha_sesion).toLocaleTimeString(
                            "es-MX",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>

                      {sesion.alumno_nombre && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Alumno:</strong> {sesion.alumno_nombre}
                        </p>
                      )}

                      {sesion.objetivos && (
                        <p className="text-sm">{sesion.objetivos}</p>
                      )}
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
  );
}
