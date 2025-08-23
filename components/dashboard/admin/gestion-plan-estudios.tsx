"use client";

import { BookOpen, Edit, Plus, Search, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/auth-client";

interface Materia {
  id: string;
  nombre: string;
  clave: string;
  semestre: number;
  tipo: "obligatoria" | "optativa";
  carrera_id: string;
}

export function GestionPlanEstudios() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [filtro, setFiltro] = useState("");
  const [semestreFiltro, setSemestreFiltro] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [showNuevaMateria, setShowNuevaMateria] = useState(false);
  const [materiaEditando, setMateriaEditando] = useState<Materia | null>(null);
  const [carreraId, setCarreraId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    clave: "",
    semestre: "",
    tipo: "obligatoria" as "obligatoria" | "optativa",
  });

  useEffect(() => {
    const fetchCarreraIdAndMaterias = async () => {
      setLoading(true);
      const supabase = createClient();
      // 1. Obtener carrera_id de Ingeniería Electromecánica
      const { data: carrera, error: carreraError } = await supabase
        .from("carreras")
        .select("id")
        .eq("codigo", "IEME-2010-210")
        .single();
      if (carreraError || !carrera) {
        setLoading(false);
        return;
      }
      setCarreraId(carrera.id);
      // 2. Obtener materias de esa carrera
      const { data: materiasDb, error: materiasError } = await supabase
        .from("materias")
        .select("*")
        .eq("carrera_id", carrera.id);
      if (!materiasError && materiasDb) {
        setMaterias(materiasDb);
      }
      setLoading(false);
    };
    fetchCarreraIdAndMaterias();
  }, []);

  const materiasFiltradas = materias.filter((materia) => {
    const coincideFiltro =
      materia.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      materia.clave.toLowerCase().includes(filtro.toLowerCase());

    const coincideSemestre =
      semestreFiltro === "todos" ||
      materia.semestre.toString() === semestreFiltro;

    return coincideFiltro && coincideSemestre;
  });

  const materiasPorSemestre = materiasFiltradas.reduce((acc, materia) => {
    if (!acc[materia.semestre]) {
      acc[materia.semestre] = [];
    }
    acc[materia.semestre].push(materia);
    return acc;
  }, {} as Record<number, Materia[]>);

  const handleNuevaMateria = () => {
    setMateriaEditando(null);
    setFormData({
      nombre: "",
      clave: "",
      semestre: "",
      tipo: "obligatoria",
    });
    setShowNuevaMateria(true);
  };

  const handleEditarMateria = (materia: Materia) => {
    setMateriaEditando(materia);
    setFormData({
      nombre: materia.nombre,
      clave: materia.clave,
      semestre: materia.semestre.toString(),
      tipo: materia.tipo,
    });
    setShowNuevaMateria(true);
  };

  const handleGuardarMateria = async () => {
    const supabase = createClient();
    if (!carreraId) return;
    setLoading(true);
    if (materiaEditando) {
      // Editar materia existente en la DB
      await supabase
        .from("materias")
        .update({
          nombre: formData.nombre,
          clave: formData.clave,
          semestre: Number.parseInt(formData.semestre),
          tipo: formData.tipo,
        })
        .eq("id", materiaEditando.id);
      // Refrescar materias
    } else {
      // Crear nueva materia en la DB
      await supabase.from("materias").insert([
        {
          nombre: formData.nombre,
          clave: formData.clave,
          semestre: Number.parseInt(formData.semestre),
          tipo: formData.tipo,
          carrera_id: carreraId,
        },
      ]);
      // Refrescar materias
    }
    // Refrescar lista de materias
    const { data: materiasDb } = await supabase
      .from("materias")
      .select("*")
      .eq("carrera_id", carreraId);
    if (materiasDb) setMaterias(materiasDb);
    setLoading(false);
    setShowNuevaMateria(false);
  };

  const handleEliminarMateria = async (id: string) => {
    const supabase = createClient();
    setLoading(true);
    await supabase.from("materias").delete().eq("id", id);
    // Refrescar lista de materias
    if (carreraId) {
      const { data: materiasDb } = await supabase
        .from("materias")
        .select("*")
        .eq("carrera_id", carreraId);
      if (materiasDb) setMaterias(materiasDb);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header y Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Plan de Estudios - Ingeniería Electromecánica
              </CardTitle>
              <CardDescription>
                Administra las materias del plan de estudios
              </CardDescription>
            </div>
            <Button onClick={handleNuevaMateria}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Materia
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materias por nombre o clave..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={semestreFiltro} onValueChange={setSemestreFiltro}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los semestres</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    {sem}° Semestre
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materias por Semestre */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(materiasPorSemestre)
            .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
            .map(([semestre, materiasDelSemestre]) => (
              <Card key={semestre}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {semestre}° Semestre
                    <Badge variant="secondary" className="ml-2">
                      {materiasDelSemestre.length} materias
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materiasDelSemestre.map((materia) => (
                      <div
                        key={materia.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{materia.nombre}</h4>
                            <p className="text-sm text-muted-foreground">
                              {materia.clave}
                            </p>
                          </div>
                          <Badge
                            variant={
                              materia.tipo === "obligatoria"
                                ? "default"
                                : "outline"
                            }
                          >
                            {materia.tipo === "obligatoria"
                              ? "Obligatoria"
                              : "Optativa"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarMateria(materia)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEliminarMateria(materia.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

          {Object.keys(materiasPorSemestre).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No se encontraron materias
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog Nueva/Editar Materia */}
      <Dialog open={showNuevaMateria} onOpenChange={setShowNuevaMateria}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {materiaEditando ? "Editar Materia" : "Nueva Materia"}
            </DialogTitle>
            <DialogDescription>
              {materiaEditando
                ? "Modifica los datos de la materia"
                : "Agrega una nueva materia al plan de estudios"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la Materia</Label>
              <Input
                placeholder="Ej: Cálculo Diferencial"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clave</Label>
                <Input
                  placeholder="Ej: ACF-0901"
                  value={formData.clave}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clave: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Semestre</Label>
                <Select
                  value={formData.semestre}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, semestre: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        {sem}° Semestre
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Materia</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "obligatoria" | "optativa") =>
                  setFormData((prev) => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="obligatoria">Obligatoria</SelectItem>
                  <SelectItem value="optativa">Optativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowNuevaMateria(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarMateria}
                disabled={
                  !formData.nombre || !formData.clave || !formData.semestre
                }
              >
                {materiaEditando ? "Actualizar" : "Crear"} Materia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
