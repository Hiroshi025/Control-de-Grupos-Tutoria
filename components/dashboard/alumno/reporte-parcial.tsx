"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaFileExcel, FaPlus, FaSpinner, FaTrash } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/auth-client";

const PARCIALES = ["1", "2", "3"];
const MAX_MATERIAS = 9;

export function ReporteParcial({ alumnoId }: { alumnoId: string }) {
  // Formulario dinámico para hasta 9 materias
  const [materias, setMaterias] = useState([
    { materia: "", motivo: "", profesor: "" },
  ]);
  const [parcial, setParcial] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportes, setReportes] = useState<any[]>([]);
  const [semestreActual, setSemestreActual] = useState<number>(1);
  const [totalMateriasSemestre, setTotalMateriasSemestre] = useState<number>(0);
  const [excelProgress, setExcelProgress] = useState<number>(0);

  // Obtener reportes enviados y datos del alumno
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      // Obtener reportes del semestre actual
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("semestre_actual")
        .eq("id", alumnoId)
        .single();
      setSemestreActual(alumno?.semestre_actual || 1);

      // Obtener total de materias del semestre actual
      const { count } = await supabase
        .from("materias")
        .select("*", { count: "exact", head: true })
        .eq("semestre", alumno?.semestre_actual || 1);
      setTotalMateriasSemestre(count || 0);

      // Obtener reportes enviados en el semestre actual
      const { data: reportesData } = await supabase
        .from("reportes_parciales")
        .select("*")
        .eq("alumno_id", alumnoId)
        .eq("semestre", String(alumno?.semestre_actual || 1))
        .order("fecha_reporte", { ascending: false });
      setReportes(reportesData || []);
    };
    fetchData();
  }, [alumnoId, loading]);

  // Manejo de cambio en materias
  const handleMateriaChange = (idx: number, field: string, value: string) => {
    setMaterias((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  // Agregar materia al formulario
  const addMateria = () => {
    if (materias.length < MAX_MATERIAS) {
      setMaterias([...materias, { materia: "", motivo: "", profesor: "" }]);
    }
  };

  // Eliminar materia del formulario
  const removeMateria = (idx: number) => {
    setMaterias(materias.filter((_, i) => i !== idx));
  };

  // Envío de formulario web
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    // Filtrar materias llenas
    const materiasReprobadas = materias.filter(
      (m) => m.materia && m.motivo && m.profesor
    );
    // Insertar cada materia reprobada como reporte
    await supabase.from("reportes_parciales").insert(
      materiasReprobadas.map((m) => ({
        ...m,
        parcial: Number(parcial),
        alumno_id: alumnoId,
        semestre: String(semestreActual),
      }))
    );

    // Calcular materias aprobadas y actualizar alumno
    const materiasAprobadas = totalMateriasSemestre - materiasReprobadas.length;
    await supabase
      .from("alumnos")
      .update({ materias_aprobadas: materiasAprobadas })
      .eq("id", alumnoId);

    setLoading(false);
    setMaterias([{ materia: "", motivo: "", profesor: "" }]);
    setParcial("");
    alert("Reporte enviado");
  };

  // Carga de archivo Excel con barra de progreso
  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelProgress(10);
    const data = await file.arrayBuffer();
    setExcelProgress(40);
    const workbook = XLSX.read(data);
    setExcelProgress(60);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    setExcelProgress(80);
    const supabase = createClient();
    setLoading(true);
    await supabase.from("reportes_parciales").insert(
      rows.map((row) => ({
        materia: row.materia,
        motivo: row.motivo,
        profesor: row.profesor,
        parcial: row.parcial,
        alumno_id: alumnoId,
      }))
    );
    setLoading(false);
    setExcelProgress(100);
    setTimeout(() => setExcelProgress(0), 1200);
    alert("Archivo procesado y reportes enviados");
  };

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-xl flex items-center gap-2">
        <FaCheckCircle className="text-green-500" />
        Reporte de Materias Reprobadas por Parcial
      </h2>
      <form
        className="space-y-4 bg-white p-4 rounded-lg shadow"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Select value={parcial} onValueChange={setParcial} required>
            <SelectContent>
              {PARCIALES.map((p) => (
                <SelectItem key={p} value={p}>
                  Parcial {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            Selecciona el parcial a reportar
          </span>
        </div>
        {materias.map((m, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-blue-50/30 p-2 rounded-lg"
          >
            <Input
              placeholder="Materia"
              value={m.materia}
              onChange={(e) =>
                handleMateriaChange(idx, "materia", e.target.value)
              }
              required
            />
            <Input
              placeholder="Profesor"
              value={m.profesor}
              onChange={(e) =>
                handleMateriaChange(idx, "profesor", e.target.value)
              }
              required
            />
            <Textarea
              placeholder="Motivo de reprobación"
              value={m.motivo}
              onChange={(e) =>
                handleMateriaChange(idx, "motivo", e.target.value)
              }
              required
            />
            {materias.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="w-full flex justify-center items-center"
                onClick={() => {
                  if (
                    window.confirm("¿Seguro que deseas eliminar esta materia?")
                  ) {
                    removeMateria(idx);
                  }
                }}
                data-tip="Eliminar materia"
              >
                <FaTrash />
              </Button>
            )}
          </div>
        ))}
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            onClick={addMateria}
            disabled={materias.length >= MAX_MATERIAS}
            variant="outline"
            className="flex items-center gap-1"
            data-tip="Agregar nueva materia"
          >
            <FaPlus /> Agregar Materia
          </Button>
          <Button
            type="submit"
            disabled={loading || !parcial}
            className="flex items-center gap-1 bg-blue-600 text-white"
            data-tip="Enviar reporte"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaCheckCircle />
            )}
            {loading ? "Enviando..." : "Enviar Reporte"}
          </Button>
        </div>
      </form>
      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <label className="block font-medium mb-1 flex items-center gap-2">
          <FaFileExcel className="text-green-600" />O carga un archivo Excel
          (.xlsx)
        </label>
        <Input
          type="file"
          accept=".xlsx"
          onChange={handleExcel}
          disabled={loading}
        />
        {excelProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${excelProgress}%` }}
            />
          </div>
        )}
        <small className="text-muted-foreground">
          El archivo debe tener columnas:{" "}
          <b>materia, motivo, profesor, parcial</b>
        </small>
      </div>
      {/* Sección de reportes enviados mejorada */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-md mb-4 flex items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-bold">
            <FaCheckCircle className="mr-1" />
            Historial de Reportes por Parcial
          </span>
        </h3>
        {reportes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <path stroke="#888" strokeWidth="2" d="M6 19h12M6 5h12M6 12h12" />
            </svg>
            <p className="text-sm text-muted-foreground mt-2">
              No hay reportes enviados este semestre.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg shadow">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-2 py-2 text-left">Materia</th>
                  <th className="px-2 py-2 text-left">Profesor</th>
                  <th className="px-2 py-2 text-left">Motivo</th>
                  <th className="px-2 py-2 text-center">Parcial</th>
                  <th className="px-2 py-2 text-center">Fecha</th>
                  <th className="px-2 py-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b hover:bg-blue-50/50 transition-all"
                  >
                    <td className="px-2 py-2 font-medium">{r.materia}</td>
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
                    <td className="px-2 py-2 text-center">
                      <span className="inline-block bg-green-100 text-green-700 rounded px-2 py-1 text-xs">
                        Enviado
                      </span>
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
      <Tooltip id="main-tooltip" />
    </div>
  );
}
