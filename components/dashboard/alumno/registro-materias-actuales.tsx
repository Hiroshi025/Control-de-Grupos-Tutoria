import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/auth-client";

interface RegistroMateriasActualesProps {
  alumnoId: string;
  semestre: number;
  onRegistro?: () => void;
}

export function RegistroMateriasActuales({
  alumnoId,
  semestre,
  onRegistro,
}: RegistroMateriasActualesProps) {
  const [materias, setMaterias] = useState<any[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaterias() {
      setLoading(true);
      setErrorMsg(null);
      const supabase = createClient();
      // Obtener materias del semestre y carrera del alumno
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("carrera_id")
        .eq("id", alumnoId)
        .single();
      if (!alumno) {
        setErrorMsg("No se pudo obtener la carrera del alumno.");
        setLoading(false);
        return;
      }
      const { data: materiasData } = await supabase
        .from("materias")
        .select("id, nombre, clave")
        .eq("carrera_id", alumno.carrera_id)
        .eq("semestre", semestre);
      setMaterias(materiasData || []);
      setLoading(false);
    }
    fetchMaterias();
  }, [alumnoId, semestre]);

  const handleSeleccion = (id: string, checked: boolean) => {
    setSeleccionadas((prev) =>
      checked ? [...prev, id] : prev.filter((mid) => mid !== id)
    );
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setErrorMsg(null);
    if (seleccionadas.length === 0) {
      setErrorMsg("Debes seleccionar al menos una materia.");
      setGuardando(false);
      return;
    }
    const supabase = createClient();
    // Registrar materias seleccionadas en la tabla materias_alumno
    const { error } = await supabase.from("materias_alumno").insert(
      seleccionadas.map((materia_id) => ({
        alumno_id: alumnoId,
        materia_id,
        semestre,
      }))
    );
    if (error) {
      setErrorMsg("Error al registrar materias: " + error.message);
      setGuardando(false);
      return;
    }
    // Actualizar el campo materias_actualmente_cursando en alumnos
    await supabase
      .from("alumnos")
      .update({ materias_actualmente_cursando: seleccionadas.length })
      .eq("id", alumnoId);

    setGuardando(false);
    if (onRegistro) onRegistro();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Materias del Semestre</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando materias...</div>
        ) : (
          <>
            <div className="mb-4 text-sm">
              Selecciona las materias que vas a cursar este semestre:
            </div>
            <div className="space-y-2 mb-4">
              {materias.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No hay materias disponibles para este semestre.
                </div>
              ) : (
                materias.map((materia) => (
                  <div key={materia.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={materia.id}
                      checked={seleccionadas.includes(materia.id)}
                      onChange={(e) =>
                        handleSeleccion(materia.id, e.target.checked)
                      }
                    />
                    <label htmlFor={materia.id} className="cursor-pointer">
                      {materia.nombre}{" "}
                      <span className="text-muted-foreground">
                        ({materia.clave})
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
            {errorMsg && (
              <div className="text-red-600 text-sm mb-2">{errorMsg}</div>
            )}
            <Button
              onClick={handleGuardar}
              disabled={guardando || seleccionadas.length === 0}
              className="w-full"
            >
              {guardando ? "Guardando..." : "Registrar Materias"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
