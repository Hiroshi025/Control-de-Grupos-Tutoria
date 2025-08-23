"use client";

import { Calendar, Search, User, Users } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/auth-client";

interface RegistroSesionesProps {
  grupoId: string;
}

interface SesionRegistrada {
  id: string;
  fecha_sesion: string;
  tipo: "grupal" | "individual";
  objetivos?: string;
  temas_tratados?: string;
  acuerdos_compromisos?: string;
  alumno_nombre?: string;
}

export function RegistroSesiones({ grupoId }: RegistroSesionesProps) {
  const [sesiones, setSesiones] = useState<SesionRegistrada[]>([]);
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSesiones() {
      setLoading(true);
      try {
        const supabase = createClient();
        // Obtener sesiones del grupo
        const { data: sesionesData, error } = await supabase
          .from("sesiones_tutoria")
          .select(
            "id, fecha_sesion, tipo, objetivos, temas_tratados, acuerdos_compromisos, alumno_id"
          )
          .eq("grupo_id", grupoId)
          .order("fecha_sesion", { ascending: false });

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
            temas_tratados: sesion.temas_tratados,
            acuerdos_compromisos: sesion.acuerdos_compromisos,
            alumno_nombre:
              sesion.tipo === "individual" && sesion.alumno_id
                ? alumnosMap[sesion.alumno_id]
                : undefined,
          }))
        );
      } catch (err) {
        setSesiones([]);
      }
      setLoading(false);
    }
    fetchSesiones();
  }, [grupoId]);

  const sesionesFiltradas = sesiones.filter((sesion) => {
    const coincideFiltro =
      sesion.objetivos?.toLowerCase().includes(filtro.toLowerCase()) ||
      sesion.temas_tratados?.toLowerCase().includes(filtro.toLowerCase()) ||
      sesion.alumno_nombre?.toLowerCase().includes(filtro.toLowerCase());

    const coincideTipo = tipoFiltro === "todos" || sesion.tipo === tipoFiltro;

    return coincideFiltro && coincideTipo;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Registro de Sesiones</CardTitle>
            <CardDescription>
              Historial de sesiones de tutoría realizadas
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en sesiones..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="grupal">Grupales</SelectItem>
                <SelectItem value="individual">Individuales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : sesionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron sesiones</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sesionesFiltradas.map((sesion) => (
              <div
                key={sesion.id}
                className="border rounded-lg p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {sesion.tipo === "grupal" ? (
                        <Users className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {sesion.tipo === "grupal"
                            ? "Sesión Grupal"
                            : "Sesión Individual"}
                        </h3>
                        <Badge
                          variant={
                            sesion.tipo === "grupal" ? "secondary" : "outline"
                          }
                        >
                          {sesion.tipo}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Generar Reporte
                  </Button>
                </div>

                {sesion.alumno_nombre && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <strong>Alumno:</strong> {sesion.alumno_nombre}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {sesion.objetivos && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Objetivos
                      </h4>
                      <p className="text-sm">{sesion.objetivos}</p>
                    </div>
                  )}

                  {sesion.temas_tratados && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Temas Tratados
                      </h4>
                      <p className="text-sm">{sesion.temas_tratados}</p>
                    </div>
                  )}

                  {sesion.acuerdos_compromisos && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Acuerdos y Compromisos
                      </h4>
                      <p className="text-sm">{sesion.acuerdos_compromisos}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
