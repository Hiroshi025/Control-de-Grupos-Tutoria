"use client";

import { Calendar, ChevronRight, User, Users } from "lucide-react";
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

interface MisTutoriasProps {
  alumnoId: string;
}

interface SesionTutoria {
  id: string;
  fecha_sesion: string;
  tipo: "grupal" | "individual";
  objetivos?: string;
  acuerdos_compromisos?: string;
  profesor_nombre: string;
}

export function MisTutorias({ alumnoId }: MisTutoriasProps) {
  const [sesiones, setSesiones] = useState<SesionTutoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSesiones() {
      setLoading(true);
      try {
        const supabase = createClient();
        // Buscar sesiones individuales y grupales del alumno
        const { data: sesionesData, error } = await supabase
          .from("sesiones_tutoria")
          .select(
            "id, fecha_sesion, tipo, objetivos, acuerdos_compromisos, profesor_id"
          )
          .or(`alumno_id.eq.${alumnoId},tipo.eq.grupal`)
          .order("fecha_sesion", { ascending: false });

        if (!sesionesData || error) {
          setSesiones([]);
          setLoading(false);
          return;
        }

        // Obtener nombres de profesores
        const profesorIds = [
          ...new Set(sesionesData.map((s: any) => s.profesor_id)),
        ];
        let profesoresMap: Record<string, string> = {};
        if (profesorIds.length > 0) {
          const { data: profesores } = await supabase
            .from("profesores")
            .select("id, nombre_completo")
            .in("id", profesorIds);
          profesoresMap = (profesores || []).reduce((acc: any, prof: any) => {
            acc[prof.id] = prof.nombre_completo;
            return acc;
          }, {});
        }

        setSesiones(
          sesionesData.map((sesion: any) => ({
            id: sesion.id,
            fecha_sesion: sesion.fecha_sesion,
            tipo: sesion.tipo,
            objetivos: sesion.objetivos,
            acuerdos_compromisos: sesion.acuerdos_compromisos,
            profesor_nombre: profesoresMap[sesion.profesor_id] || "Tutor",
          }))
        );
      } catch (err) {
        setSesiones([]);
      }
      setLoading(false);
    }
    fetchSesiones();
  }, [alumnoId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Tutorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Tutorías</CardTitle>
        <CardDescription>
          Historial de sesiones y acuerdos establecidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sesiones.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No hay sesiones de tutoría registradas
          </p>
        ) : (
          <div className="space-y-4">
            {sesiones.map((sesion) => (
              <div
                key={sesion.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {sesion.tipo === "grupal" ? (
                      <Users className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Badge
                      variant={
                        sesion.tipo === "grupal" ? "secondary" : "outline"
                      }
                    >
                      {sesion.tipo === "grupal" ? "Grupal" : "Individual"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(sesion.fecha_sesion).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-sm">
                    {sesion.profesor_nombre}
                  </p>
                  {sesion.objetivos && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Objetivos:
                      </p>
                      <p className="text-sm">{sesion.objetivos}</p>
                    </div>
                  )}
                  {sesion.acuerdos_compromisos && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Acuerdos:
                      </p>
                      <p className="text-sm">{sesion.acuerdos_compromisos}</p>
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                  Ver detalles
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ))}

            <Button variant="outline" className="w-full bg-transparent">
              Ver Todas las Tutorías
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
