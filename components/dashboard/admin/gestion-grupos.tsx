"use client";

import { Edit, Eye, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { createClient } from "@/lib/auth-client";

interface Grupo {
  id: string;
  nombre: string;
  semestre: number;
  carrera_id: string;
  horario_tutoria?: string;
  activo: boolean;
}

interface Carrera {
  id: string;
  nombre: string;
  codigo: string;
}

export function GestionGrupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<Grupo | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [grupoVista, setGrupoVista] = useState<Grupo | null>(null);
  const [alumnosGrupo, setAlumnosGrupo] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    semestre: "",
    carrera_id: "",
    horario_tutoria: "",
    fin_de_semestre: "",
    activo: true,
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      const { data: gruposDb } = await supabase
        .from("grupos")
        .select("*")
        .order("semestre", { ascending: true });
      setGrupos(gruposDb ?? []);
      const { data: carrerasDb } = await supabase
        .from("carreras")
        .select("id, nombre, codigo");
      setCarreras(carrerasDb ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleNuevoGrupo = () => {
    setEditando(null);
    setFormData({
      nombre: "",
      semestre: "",
      carrera_id: "",
      horario_tutoria: "",
      fin_de_semestre: "",
      activo: true,
    });
    setShowDialog(true);
  };

  const handleEditarGrupo = (grupo: Grupo) => {
    setEditando(grupo);
    setFormData({
      nombre: grupo.nombre,
      semestre: grupo.semestre.toString(),
      carrera_id: grupo.carrera_id,
      horario_tutoria: grupo.horario_tutoria ?? "",
      fin_de_semestre: grupo.fin_de_semestre
        ? grupo.fin_de_semestre.split("T")[0]
        : "",
      activo: grupo.activo,
    });
    setShowDialog(true);
  };

  const handleGuardarGrupo = async () => {
    setLoading(true);
    const supabase = createClient();
    if (editando) {
      await supabase
        .from("grupos")
        .update({
          nombre: formData.nombre,
          semestre: Number(formData.semestre),
          carrera_id: formData.carrera_id,
          horario_tutoria: formData.horario_tutoria,
          fin_de_semestre: formData.fin_de_semestre || null,
          activo: formData.activo,
        })
        .eq("id", editando.id);
    } else {
      await supabase.from("grupos").insert([
        {
          nombre: formData.nombre,
          semestre: Number(formData.semestre),
          carrera_id: formData.carrera_id,
          horario_tutoria: formData.horario_tutoria,
          fin_de_semestre: formData.fin_de_semestre || null,
          activo: formData.activo,
        },
      ]);
    }
    setShowDialog(false);
    setTimeout(() => window.location.reload(), 500);
  };

  const handleEliminarGrupo = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este grupo?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("grupos").delete().eq("id", id);
    setTimeout(() => window.location.reload(), 500);
  };

  // Función para ver detalles del grupo
  const handleVerGrupo = async (grupo: Grupo) => {
    setGrupoVista(grupo);
    setShowViewDialog(true);
    const supabase = createClient();
    // Obtener alumnos vinculados al grupo
    const { data: alumnosDb } = await supabase
      .from("alumno_grupo")
      .select(
        "alumno_id, alumnos(nombre_completo, matricula, correo_institucional)"
      )
      .eq("grupo_id", grupo.id)
      .eq("activo", true);
    setAlumnosGrupo(
      (alumnosDb ?? []).map((row: any) => ({
        ...row.alumnos,
        alumno_id: row.alumno_id,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Grupos
              </CardTitle>
              <CardDescription>
                Crea, edita y elimina grupos de tutoría
              </CardDescription>
            </div>
            <Button onClick={handleNuevoGrupo}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Grupo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {grupos.map((grupo) => (
                <div
                  key={grupo.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium">{grupo.nombre}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Semestre: {grupo.semestre}°</span>
                      <span>
                        Carrera:{" "}
                        {carreras.find((c) => c.id === grupo.carrera_id)
                          ?.nombre || "Sin carrera"}
                      </span>
                      {grupo.horario_tutoria && (
                        <span>Horario: {grupo.horario_tutoria}</span>
                      )}
                    </div>
                    <Badge variant={grupo.activo ? "default" : "destructive"}>
                      {grupo.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerGrupo(grupo)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditarGrupo(grupo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEliminarGrupo(grupo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {grupos.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No hay grupos registrados
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar Grupo */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar Grupo" : "Nuevo Grupo"}
            </DialogTitle>
            <DialogDescription>
              {editando
                ? "Modifica los datos del grupo"
                : "Agrega un nuevo grupo de tutoría"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Grupo</Label>
              <Input
                placeholder="Ej: 1A, 2B, 3C"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label>Carrera</Label>
                <Select
                  value={formData.carrera_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, carrera_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {carreras.map((carrera) => (
                      <SelectItem key={carrera.id} value={carrera.id}>
                        {carrera.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horario de Tutoría (opcional)</Label>
              <Input
                placeholder="Ej: Lunes 10:00-12:00"
                value={formData.horario_tutoria}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    horario_tutoria: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fin de Semestre</Label>
              <Input
                type="date"
                value={formData.fin_de_semestre}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fin_de_semestre: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formData.activo ? "activo" : "inactivo"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    activo: value === "activo",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarGrupo}
                disabled={
                  !formData.nombre || !formData.semestre || !formData.carrera_id
                }
              >
                {editando ? "Actualizar" : "Crear"} Grupo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Grupo */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Información del Grupo</DialogTitle>
            <DialogDescription>
              Consulta todos los datos y alumnos vinculados al grupo.
            </DialogDescription>
          </DialogHeader>
          {grupoVista && (
            <div className="space-y-4">
              <div>
                <strong>Nombre:</strong> {grupoVista.nombre}
              </div>
              <div>
                <strong>Semestre:</strong> {grupoVista.semestre}°
              </div>
              <div>
                <strong>Carrera:</strong>{" "}
                {carreras.find((c) => c.id === grupoVista.carrera_id)?.nombre ||
                  "Sin carrera"}
              </div>
              <div>
                <strong>Horario de Tutoría:</strong>{" "}
                {grupoVista.horario_tutoria || "No asignado"}
              </div>
              <div>
                <strong>Estado:</strong>{" "}
                <Badge variant={grupoVista.activo ? "default" : "destructive"}>
                  {grupoVista.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div>
                <strong>Alumnos Vinculados:</strong>
                {alumnosGrupo.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {alumnosGrupo.map((al) => (
                      <li
                        key={al.alumno_id}
                        className="border rounded px-2 py-1"
                      >
                        <span className="font-medium">
                          {al.nombre_completo}
                        </span>{" "}
                        - {al.matricula} <br />
                        <span className="text-xs text-muted-foreground">
                          {al.correo_institucional}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 text-muted-foreground">
                    No hay alumnos asignados
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
