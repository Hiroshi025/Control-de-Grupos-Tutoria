"use client";

import { Clock, User, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { createClient } from "@/lib/auth-client";

// Importa react-calendar dinámicamente para evitar problemas SSR
const ReactCalendar = dynamic(() => import("react-calendar"), { ssr: false });

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sesionesDelDia, setSesionesDelDia] = useState<SesionAgendada[]>([]);
  const [showDetalles, setShowDetalles] = useState(false);

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

  // Memo para obtener los días con sesiones programadas
  const diasConSesiones = useMemo(() => {
    const dias = new Set<string>();
    sesiones.forEach((s) => {
      // Solo sesiones programadas
      if (s.estado === "programada") {
        dias.add(s.fecha_sesion.slice(0, 10));
      }
    });
    return dias;
  }, [sesiones]);

  // Función para obtener sesiones de un día
  const getSesionesPorFecha = (date: Date) => {
    const fechaISO = date.toISOString().slice(0, 10);
    return sesiones.filter((s) => s.fecha_sesion.slice(0, 10) === fechaISO);
  };

  // Marcar días con sesiones en el calendario con mejor diseño
  const tileContent = ({ date }: { date: Date }) => {
    const fechaISO = date.toISOString().slice(0, 10);
    const sesionesDia = getSesionesPorFecha(date);
    if (sesionesDia.length > 0) {
      return (
        <div className="flex justify-center items-center mt-1">
          <Badge
            variant="default"
            className="px-2 py-0 text-xs bg-primary text-white border-none"
          >
            {sesionesDia.length}
          </Badge>
        </div>
      );
    }
    return null;
  };

  // Resalta el día si hay sesión programada
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const fechaISO = date.toISOString().slice(0, 10);
      if (diasConSesiones.has(fechaISO)) {
        return "bg-primary/20 border-primary border-2 rounded-full font-bold text-primary";
      }
    }
    return "";
  };

  // Al seleccionar fecha, mostrar detalles
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSesionesDelDia(getSesionesPorFecha(date));
    setShowDetalles(true);
  };

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
              Visualiza todas las sesiones agendadas con los alumnos del grupo
            </CardDescription>
          </div>
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
        ) : (
          <div>
            <div className="mb-6">
              <ReactCalendar
                locale="es-MX"
                onClickDay={handleDateClick}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="rounded-lg border shadow calendar-custom"
              />
              <style jsx global>{`
                .calendar-custom .react-calendar__tile.bg-primary\/20 {
                  background: rgba(59, 130, 246, 0.15) !important;
                  border: 2px solid #3b82f6 !important;
                  color: #2563eb !important;
                }
                .calendar-custom .react-calendar__tile--active {
                  background: #2563eb !important;
                  color: #fff !important;
                }
              `}</style>
            </div>
            <Dialog open={showDetalles} onOpenChange={setShowDetalles}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Sesiones del día{" "}
                    {selectedDate &&
                      selectedDate.toLocaleDateString("es-MX", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                  </DialogTitle>
                  <DialogDescription>
                    {sesionesDelDia.length === 0
                      ? "No hay sesiones agendadas para este día."
                      : "Detalles de las sesiones agendadas:"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {sesionesDelDia.map((sesion) => (
                    <div
                      key={sesion.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {sesion.tipo === "grupal" ? (
                            <Users className="h-5 w-5 text-primary" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">
                              {sesion.tipo === "grupal"
                                ? "Sesión Grupal"
                                : "Sesión Individual"}
                            </h3>
                            <Badge variant={getEstadoColor(sesion.estado)}>
                              {getEstadoText(sesion.estado)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            {new Date(sesion.fecha_sesion).toLocaleTimeString(
                              "es-MX",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                          {sesion.alumno_nombre && (
                            <div className="text-sm text-muted-foreground mb-1">
                              <strong>Alumno:</strong> {sesion.alumno_nombre}
                            </div>
                          )}
                          {sesion.objetivos && (
                            <div className="text-sm">{sesion.objetivos}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {sesionesDelDia.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay sesiones agendadas para este día.
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
