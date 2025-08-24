"use client";

import { Calendar, FileText, Search, User, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
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
  materias_reprobadas_parcial?: string[];
  materias_a_recurso_final?: string[];
}

interface ReporteParcial {
  id: string;
  alumno_id: string;
  materia: string;
  motivo: string;
  profesor: string;
  parcial: number;
  semestre: string;
  fecha_reporte: string;
  alumno_nombre?: string;
}

export function RegistroSesiones({ grupoId }: RegistroSesionesProps) {
  const [sesiones, setSesiones] = useState<SesionRegistrada[]>([]);
  const [reportes, setReportes] = useState<ReporteParcial[]>([]);
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [showReporte, setShowReporte] = useState(false);
  const [sesionReporte, setSesionReporte] = useState<SesionRegistrada | null>(
    null
  );

  // Obtener sesiones de tutoría
  useEffect(() => {
    async function fetchSesiones() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: sesionesData, error } = await supabase
          .from("sesiones_tutoria")
          .select(
            "id, fecha_sesion, tipo, objetivos, temas_tratados, acuerdos_compromisos, alumno_id, materias_reprobadas_parcial, materias_a_recurso_final"
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
            materias_reprobadas_parcial: Array.isArray(
              sesion.materias_reprobadas_parcial
            )
              ? sesion.materias_reprobadas_parcial
              : sesion.materias_reprobadas_parcial
              ? JSON.parse(sesion.materias_reprobadas_parcial)
              : [],
            materias_a_recurso_final: Array.isArray(
              sesion.materias_a_recurso_final
            )
              ? sesion.materias_a_recurso_final
              : sesion.materias_a_recurso_final
              ? JSON.parse(sesion.materias_a_recurso_final)
              : [],
          }))
        );
      } catch (err) {
        setSesiones([]);
      }
      setLoading(false);
    }
    fetchSesiones();
  }, [grupoId]);

  // Obtener reportes académicos enviados por los alumnos del grupo
  useEffect(() => {
    async function fetchReportes() {
      setLoadingReportes(true);
      try {
        const supabase = createClient();
        // Obtener alumnos activos del grupo
        const { data: alumnosGrupo } = await supabase
          .from("alumno_grupo")
          .select("alumno_id")
          .eq("grupo_id", grupoId)
          .eq("activo", true);

        const alumnoIds = alumnosGrupo
          ? alumnosGrupo.map((ag: any) => ag.alumno_id)
          : [];
        if (alumnoIds.length === 0) {
          setReportes([]);
          setLoadingReportes(false);
          return;
        }

        // Obtener reportes parciales de esos alumnos
        const { data: reportesData } = await supabase
          .from("reportes_parciales")
          .select("*")
          .in("alumno_id", alumnoIds)
          .order("fecha_reporte", { ascending: false });

        // Obtener nombres de alumnos
        let alumnosMap: Record<string, string> = {};
        const { data: alumnos } = await supabase
          .from("alumnos")
          .select("id, nombre_completo")
          .in("id", alumnoIds);
        alumnosMap = (alumnos || []).reduce((acc: any, alumno: any) => {
          acc[alumno.id] = alumno.nombre_completo;
          return acc;
        }, {});

        setReportes(
          (reportesData || []).map((r: any) => ({
            ...r,
            alumno_nombre: alumnosMap[r.alumno_id] || "",
          }))
        );
      } catch (err) {
        setReportes([]);
      }
      setLoadingReportes(false);
    }
    fetchReportes();
  }, [grupoId]);

  const sesionesFiltradas = sesiones.filter((sesion) => {
    const coincideFiltro =
      (sesion.objetivos?.toLowerCase().includes(filtro.toLowerCase()) ??
        false) ||
      (sesion.temas_tratados?.toLowerCase().includes(filtro.toLowerCase()) ??
        false) ||
      (sesion.alumno_nombre?.toLowerCase().includes(filtro.toLowerCase()) ??
        false);

    const coincideTipo = tipoFiltro === "todos" || sesion.tipo === tipoFiltro;

    return coincideFiltro && coincideTipo;
  });

  // Handler para mostrar el reporte de sesión
  const handleGenerarReporte = (sesion: SesionRegistrada) => {
    setSesionReporte(sesion);
    setShowReporte(true);
  };

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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerarReporte(sesion)}
                  >
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

                  {sesion.materias_reprobadas_parcial &&
                    sesion.materias_reprobadas_parcial.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          Materias Reprobadas en Parcial
                        </h4>
                        <ul className="list-disc ml-5 text-sm">
                          {sesion.materias_reprobadas_parcial.map(
                            (mat, idx) => (
                              <li key={idx}>{mat}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {sesion.materias_a_recurso_final &&
                    sesion.materias_a_recurso_final.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          Materias que van a Recurso
                        </h4>
                        <ul className="list-disc ml-5 text-sm">
                          {sesion.materias_a_recurso_final.map((mat, idx) => (
                            <li key={idx}>{mat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sección de reportes académicos enviados por los alumnos */}
        <div className="mt-10">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            Reportes Académicos Enviados por Alumnos
          </h3>
          {loadingReportes ? (
            <div className="animate-pulse h-16 bg-muted rounded-lg"></div>
          ) : reportes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay reportes académicos enviados por los alumnos de este grupo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg shadow">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-2 py-2 text-left">Alumno</th>
                    <th className="px-2 py-2 text-left">Materia</th>
                    <th className="px-2 py-2 text-left">Profesor</th>
                    <th className="px-2 py-2 text-left">Motivo</th>
                    <th className="px-2 py-2 text-center">Parcial</th>
                    <th className="px-2 py-2 text-center">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b hover:bg-blue-50/50 transition-all"
                    >
                      <td className="px-2 py-2 font-medium">
                        {r.alumno_nombre}
                      </td>
                      <td className="px-2 py-2">{r.materia}</td>
                      <td className="px-2 py-2">{r.profesor}</td>
                      <td className="px-2 py-2">{r.motivo}</td>
                      <td className="px-2 py-2 text-center">
                        <span className="inline-block bg-blue-200 text-blue-800 rounded px-2 py-1 text-xs">
                          {r.parcial}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        {new Date(r.fecha_reporte).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                <span className="font-semibold">Total reportes:</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                  {reportes.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {/* Modal para reporte detallado */}
      <Dialog open={showReporte} onOpenChange={setShowReporte}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reporte de Sesión</DialogTitle>
            <DialogDescription>
              Detalles completos de la sesión seleccionada
            </DialogDescription>
          </DialogHeader>
          {sesionReporte && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    sesionReporte.tipo === "grupal" ? "secondary" : "outline"
                  }
                >
                  {sesionReporte.tipo === "grupal"
                    ? "Sesión Grupal"
                    : "Sesión Individual"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(sesionReporte.fecha_sesion).toLocaleString("es-MX")}
                </span>
              </div>
              {sesionReporte.alumno_nombre && (
                <div className="mb-2">
                  <strong>Alumno:</strong> {sesionReporte.alumno_nombre}
                </div>
              )}
              {sesionReporte.objetivos && (
                <div>
                  <strong>Objetivos:</strong> {sesionReporte.objetivos}
                </div>
              )}
              {sesionReporte.temas_tratados && (
                <div>
                  <strong>Temas Tratados:</strong>{" "}
                  {sesionReporte.temas_tratados}
                </div>
              )}
              {sesionReporte.acuerdos_compromisos && (
                <div>
                  <strong>Acuerdos y Compromisos:</strong>{" "}
                  {sesionReporte.acuerdos_compromisos}
                </div>
              )}
              {sesionReporte.materias_reprobadas_parcial &&
                sesionReporte.materias_reprobadas_parcial.length > 0 && (
                  <div>
                    <strong>Materias Reprobadas en Parcial:</strong>
                    <ul className="list-disc ml-5">
                      {sesionReporte.materias_reprobadas_parcial.map(
                        (mat, idx) => (
                          <li key={idx}>{mat}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              {sesionReporte.materias_a_recurso_final &&
                sesionReporte.materias_a_recurso_final.length > 0 && (
                  <div>
                    <strong>Materias que van a Recurso:</strong>
                    <ul className="list-disc ml-5">
                      {sesionReporte.materias_a_recurso_final.map(
                        (mat, idx) => (
                          <li key={idx}>{mat}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
