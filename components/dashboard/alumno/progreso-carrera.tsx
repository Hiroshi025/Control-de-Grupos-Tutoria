import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/auth-client";

interface ProgresoCarreraProps {
  alumnoId?: string;
  correo?: string;
}

export function ProgresoCarrera({ alumnoId, correo }: ProgresoCarreraProps) {
  const [alumno, setAlumno] = useState<any>(null);
  const [totalMateriasEstimadas, setTotalMateriasEstimadas] =
    useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        let query = supabase.from("alumnos").select("*").single();
        if (alumnoId) {
          query = supabase
            .from("alumnos")
            .select("*")
            .eq("id", alumnoId)
            .single();
        } else if (correo) {
          query = supabase
            .from("alumnos")
            .select("*")
            .eq("correo_institucional", correo)
            .single();
        }
        const { data: alumnoData, error: errorAlumno } = await query;
        if (errorAlumno || !alumnoData) {
          setError("No se pudo cargar el alumno");
          setLoading(false);
          return;
        }
        setAlumno(alumnoData);

        // Obtener el total de materias de la carrera real
        const { data: materias, error: errorMaterias } = await supabase
          .from("materias")
          .select("id")
          .eq("carrera_id", alumnoData.carrera_id);
        setTotalMateriasEstimadas(materias ? materias.length : 0);
      } catch (err) {
        setError("Error de conexión");
      }
      setLoading(false);
    }
    fetchData();
  }, [alumnoId, correo]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Carrera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !alumno) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Carrera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-destructive">
            {error || "Alumno no encontrado"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const porcentajeProgreso =
    totalMateriasEstimadas > 0
      ? Math.round((alumno.materias_aprobadas / totalMateriasEstimadas) * 100)
      : 0;
  const porcentajeSemestre = Math.round((alumno.semestre_actual / 9) * 100); // 9 semestres típicos

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso de Carrera</CardTitle>
        <CardDescription>Avance en el plan de estudios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Materias Aprobadas</span>
            <span>{porcentajeProgreso}%</span>
          </div>
          <Progress value={porcentajeProgreso} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {alumno.materias_aprobadas} de ~{totalMateriasEstimadas} materias
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso por Semestre</span>
            <span>{porcentajeSemestre}%</span>
          </div>
          <Progress value={porcentajeSemestre} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Semestre {alumno.semestre_actual} de 9
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {alumno.semestre_actual}
            </p>
            <p className="text-xs text-muted-foreground">Semestre Actual</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">
              {9 - alumno.semestre_actual}
            </p>
            <p className="text-xs text-muted-foreground">Semestres Restantes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
