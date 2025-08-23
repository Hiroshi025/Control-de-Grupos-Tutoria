"use client";

import {
  Edit,
  Eye,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/auth-client";

import { NuevoUsuarioDialog } from "./nuevo-usuario-dialog";

interface Usuario {
  id: string;
  nombre_completo: string;
  correo_institucional: string;
  edad?: number;
  foto_perfil?: string;
  // Campos específicos de alumno
  matricula?: string;
  semestre_actual?: number;
  materias_aprobadas?: number;
  materias_en_recurso?: number;
  // Campos específicos de profesor
  grupos_actuales?: number;
}

export function GestionUsuarios() {
  const [alumnos, setAlumnos] = useState<Usuario[]>([]);
  const [profesores, setProfesores] = useState<Usuario[]>([]);
  const [filtroAlumnos, setFiltroAlumnos] = useState("");
  const [filtroProfesores, setFiltroProfesores] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNuevoUsuario, setShowNuevoUsuario] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<"alumno" | "profesor">(
    "alumno"
  );

  // Cargar datos reales
  useEffect(() => {
    async function fetchUsuarios() {
      setLoading(true);
      const supabase = createClient();

      // Alumnos
      const { data: alumnosData } = await supabase
        .from("alumnos")
        .select(
          "id, nombre_completo, correo_institucional, edad, foto_credencial, matricula, semestre_actual, materias_aprobadas, materias_en_recurso"
        );
      setAlumnos(
        (alumnosData ?? []).map((a: any) => ({
          ...a,
          foto_perfil: a.foto_credencial,
        }))
      );

      // Profesores
      const { data: profesoresData } = await supabase
        .from("profesores")
        .select("id, nombre_completo, correo_institucional, edad, foto_perfil");
      // Obtener número de grupos por profesor
      const gruposPorProfesor: Record<string, number> = {};
      if (profesoresData) {
        for (const prof of profesoresData) {
          const { count } = await supabase
            .from("profesor_grupo")
            .select("*", { count: "exact", head: true })
            .eq("profesor_id", prof.id)
            .eq("activo", true);
          gruposPorProfesor[prof.id] = count ?? 0;
        }
      }
      setProfesores(
        (profesoresData ?? []).map((p: any) => ({
          ...p,
          grupos_actuales: gruposPorProfesor[p.id] ?? 0,
        }))
      );

      setLoading(false);
    }
    fetchUsuarios();
  }, []);

  const alumnosFiltrados = alumnos.filter(
    (alumno) =>
      alumno.nombre_completo
        .toLowerCase()
        .includes(filtroAlumnos.toLowerCase()) ||
      alumno.matricula?.includes(filtroAlumnos) ||
      alumno.correo_institucional
        .toLowerCase()
        .includes(filtroAlumnos.toLowerCase())
  );

  const profesoresFiltrados = profesores.filter(
    (profesor) =>
      profesor.nombre_completo
        .toLowerCase()
        .includes(filtroProfesores.toLowerCase()) ||
      profesor.correo_institucional
        .toLowerCase()
        .includes(filtroProfesores.toLowerCase())
  );

  const handleNuevoUsuario = (tipo: "alumno" | "profesor") => {
    setTipoUsuario(tipo);
    setShowNuevoUsuario(true);
  };

  // Crear alumno/profesor
  async function handleCrearUsuario(
    data: {
      nombre_completo: string;
      correo_institucional: string;
      edad: string;
      matricula: string;
      semestre_actual: string;
      password: string;
    },
    tipo: "alumno" | "profesor"
  ) {
    const supabase = createClient();
    setLoading(true);

    if (tipo === "alumno") {
      const { error: dbError } = await supabase.from("alumnos").insert([
        {
          nombre_completo: data.nombre_completo,
          correo_institucional: data.correo_institucional,
          edad: Number(data.edad),
          matricula: data.matricula,
          semestre_actual: Number(data.semestre_actual),
          materias_aprobadas: 0,
          materias_en_recurso: 0,
          foto_credencial: null,
          password_hash: data.password, // puedes guardar la contraseña aquí
          fecha_inscripcion: new Date().toISOString().slice(0, 10),
          carrera_id: null,
        },
      ]);
      if (dbError) {
        alert("Error al guardar alumno: " + dbError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: dbError } = await supabase.from("profesores").insert([
        {
          nombre_completo: data.nombre_completo,
          correo_institucional: data.correo_institucional,
          edad: Number(data.edad),
          foto_perfil: null,
          password_hash: data.password,
        },
      ]);
      if (dbError) {
        alert("Error al guardar profesor: " + dbError.message);
        setLoading(false);
        return;
      }
    }
    setShowNuevoUsuario(false);
    setTimeout(() => window.location.reload(), 500);
  }

  // Editar alumno/profesor
  async function handleEditarUsuario(
    id: string,
    data: Partial<Usuario>,
    tipo: "alumno" | "profesor"
  ) {
    const supabase = createClient();
    setLoading(true);
    if (tipo === "alumno") {
      await supabase.from("alumnos").update(data).eq("id", id);
    } else {
      await supabase.from("profesores").update(data).eq("id", id);
    }
    setTimeout(() => window.location.reload(), 500);
  }

  // Eliminar alumno/profesor
  async function handleEliminarUsuario(
    id: string,
    tipo: "alumno" | "profesor"
  ) {
    const supabase = createClient();
    setLoading(true);
    if (tipo === "alumno") {
      await supabase.from("alumnos").delete().eq("id", id);
    } else {
      await supabase.from("profesores").delete().eq("id", id);
    }
    setTimeout(() => window.location.reload(), 500);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="alumnos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
          <TabsTrigger value="profesores">Profesores</TabsTrigger>
        </TabsList>

        <TabsContent value="alumnos">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Gestión de Alumnos
                  </CardTitle>
                  <CardDescription>
                    Administra los estudiantes registrados en el sistema
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar alumnos..."
                      value={filtroAlumnos}
                      onChange={(e) => setFiltroAlumnos(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button onClick={() => handleNuevoUsuario("alumno")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Alumno
                  </Button>
                </div>
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
                  {alumnosFiltrados.map((alumno) => (
                    <div
                      key={alumno.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={alumno.foto_perfil || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {alumno.nombre_completo
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="font-medium">
                              {alumno.nombre_completo}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Matrícula: {alumno.matricula}</span>
                              <span>Semestre: {alumno.semestre_actual}°</span>
                              <span>Edad: {alumno.edad} años</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {alumno.correo_institucional}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {alumno.materias_aprobadas} aprobadas
                            </p>
                            {alumno.materias_en_recurso! > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {alumno.materias_en_recurso} en recurso
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {alumnosFiltrados.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No se encontraron alumnos
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profesores">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestión de Profesores
                  </CardTitle>
                  <CardDescription>
                    Administra los profesores registrados en el sistema
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar profesores..."
                      value={filtroProfesores}
                      onChange={(e) => setFiltroProfesores(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button onClick={() => handleNuevoUsuario("profesor")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Profesor
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {profesoresFiltrados.map((profesor) => (
                    <div
                      key={profesor.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={profesor.foto_perfil || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {profesor.nombre_completo
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="font-medium">
                              {profesor.nombre_completo}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Edad: {profesor.edad} años</span>
                              <span>Grupos: {profesor.grupos_actuales}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {profesor.correo_institucional}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">
                            {profesor.grupos_actuales} grupos
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {profesoresFiltrados.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No se encontraron profesores
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NuevoUsuarioDialog
        open={showNuevoUsuario}
        onOpenChange={setShowNuevoUsuario}
        tipoUsuario={tipoUsuario}
        onCrearUsuario={handleCrearUsuario}
      />
    </div>
  );
}
