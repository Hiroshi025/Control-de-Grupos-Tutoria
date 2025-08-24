"use client";

import { AlertTriangle, Send } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/auth-client";
import { notificationService } from "@/lib/notifications-client";

interface ReporteAcademicoProps {
  alumnoId: string;
  tutorId?: string;
}

export function ReporteAcademico({ alumnoId, tutorId }: ReporteAcademicoProps) {
  const { user } = useAuth();
  const [parcial, setParcial] = useState<string>("");
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<string[]>(
    []
  );
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [materias, setMaterias] = useState<
    { id: string; nombre: string; clave: string }[]
  >([]);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaterias() {
      setLoadingMaterias(true);
      setErrorMsg(null);
      try {
        const supabase = createClient();
        // Obtener el alumno para saber su carrera y semestre
        const { data: alumno, error: errorAlumno } = await supabase
          .from("alumnos")
          .select("carrera_id, semestre_actual")
          .eq("id", alumnoId)
          .single();
        if (!alumno || errorAlumno) {
          setMaterias([]);
          setLoadingMaterias(false);
          setErrorMsg("No se pudo obtener los datos del alumno.");
          return;
        }
        // Obtener materias de la carrera y semestre actual
        const { data: materiasData, error: errorMaterias } = await supabase
          .from("materias")
          .select("id, nombre, clave")
          .eq("carrera_id", alumno.carrera_id)
          .eq("semestre", alumno.semestre_actual);
        if (errorMaterias) {
          setErrorMsg("No se pudo obtener las materias.");
        }
        setMaterias(materiasData || []);
      } catch (err) {
        setMaterias([]);
        setErrorMsg("Error de conexión con la base de datos.");
      }
      setLoadingMaterias(false);
    }
    fetchMaterias();
  }, [alumnoId]);

  const handleMateriaChange = (materiaId: string, checked: boolean) => {
    if (checked) {
      setMateriasSeleccionadas([...materiasSeleccionadas, materiaId]);
    } else {
      setMateriasSeleccionadas(
        materiasSeleccionadas.filter((id) => id !== materiaId)
      );
    }
  };

  const handleEnviarReporte = async () => {
    setErrorMsg(null);
    if (!parcial) {
      setErrorMsg("Selecciona el parcial.");
      return;
    }
    if (materiasSeleccionadas.length === 0) {
      setErrorMsg("Selecciona al menos una materia reprobada.");
      return;
    }

    setEnviando(true);

    try {
      const supabase = createClient();
      // Obtener datos del alumno
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("semestre_actual")
        .eq("id", alumnoId)
        .single();

      // Obtener datos de las materias seleccionadas
      const materiasReportadas = materias.filter((materia) =>
        materiasSeleccionadas.includes(materia.id)
      );

      // Insertar reportes en la tabla reportes_parciales
      const { error: insertError } = await supabase
        .from("reportes_parciales")
        .insert(
          materiasReportadas.map((materia) => ({
            materia: materia.nombre,
            motivo: "Reprobada en el parcial", // Se puede mejorar para capturar motivo real
            profesor: "", // Si se requiere, buscar el profesor de la materia
            parcial: parcial === "final" ? 3 : Number(parcial),
            alumno_id: alumnoId,
            semestre: String(alumno?.semestre_actual || ""),
          }))
        );
      if (insertError) {
        setErrorMsg("Error al guardar el reporte: " + insertError.message);
        setEnviando(false);
        return;
      }

      // Notificar al tutor si existe
      if (tutorId && user?.id) {
        await notificationService.notificarReporteAcademico(
          user.id,
          tutorId,
          materiasReportadas.map((m) => m.nombre),
          parcial === "final" ? "Examen Final" : `${parcial}° Parcial`
        );
      }

      setEnviado(true);
      setEnviando(false);
      setParcial("");
      setMateriasSeleccionadas([]);
      setTimeout(() => setEnviado(false), 3000);
    } catch (error: any) {
      setErrorMsg("Error inesperado al enviar el reporte.");
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reporte Académico</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Send className="h-4 w-4" />
            <AlertDescription>
              Reporte enviado exitosamente. Tu tutor ha sido notificado.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte Académico</CardTitle>
        <CardDescription>
          Reporta materias reprobadas a tu tutor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Reporta proactivamente las materias que hayas reprobado para recibir
            apoyo oportuno de tu tutor.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium">Parcial</label>
          <Select value={parcial} onValueChange={setParcial}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el parcial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Primer Parcial</SelectItem>
              <SelectItem value="2">Segundo Parcial</SelectItem>
              <SelectItem value="3">Tercer Parcial</SelectItem>
              <SelectItem value="final">Examen Final</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Materias Reprobadas</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {loadingMaterias ? (
              <div className="text-center text-xs text-muted-foreground">
                Cargando materias...
              </div>
            ) : materias.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground">
                No hay materias disponibles
              </div>
            ) : (
              materias.map((materia) => (
                <div key={materia.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={materia.id}
                    checked={materiasSeleccionadas.includes(materia.id)}
                    onCheckedChange={(checked) =>
                      handleMateriaChange(materia.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={materia.id}
                    className="text-sm cursor-pointer flex-1"
                  >
                    <span className="font-medium">{materia.nombre}</span>
                    <span className="text-muted-foreground ml-2">
                      ({materia.clave})
                    </span>
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="text-red-600 text-sm font-semibold mb-2">
            {errorMsg}
          </div>
        )}

        <Button
          onClick={handleEnviarReporte}
          disabled={!parcial || materiasSeleccionadas.length === 0 || enviando}
          className="w-full"
        >
          {enviando ? "Enviando..." : "Enviar Reporte"}
          <Send className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
