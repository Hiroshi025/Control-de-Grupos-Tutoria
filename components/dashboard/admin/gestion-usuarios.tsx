"use client";

import { Edit, Eye, GraduationCap, Plus, Search, Trash2, Users } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [archivoCarga, setArchivoCarga] = useState<File | null>(null);

  // Estados para ver/editar/eliminar
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);
  const [modoDialogo, setModoDialogo] = useState<"ver" | "editar" | null>(null);
  const [formData, setFormData] = useState<Partial<Usuario>>({});
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

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
      // Obtener el id de la carrera de electromecánica
      const { data: carreraData } = await supabase
        .from("carreras")
        .select("id")
        .eq("codigo", "IEME-2010-210")
        .single();

      const carrera_id = carreraData?.id ?? null;

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
          password_hash: data.password,
          fecha_inscripcion: new Date().toISOString().slice(0, 10),
          carrera_id, // Asignar carrera de electromecánica
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

  // Validar campos requeridos
  function validarAlumno(obj: any) {
    const camposObligatorios = [
      "nombre_completo",
      "correo_institucional",
      "edad",
      "matricula",
      "semestre_actual",
    ];
    for (const campo of camposObligatorios) {
      if (
        obj[campo] === undefined ||
        obj[campo] === null ||
        obj[campo].toString().trim() === ""
      ) {
        return `Falta el campo obligatorio: ${campo}`;
      }
    }
    // Validaciones específicas
    if (
      isNaN(Number(obj.edad)) ||
      Number(obj.edad) < 15 ||
      Number(obj.edad) > 100
    ) {
      return "La edad debe ser un número válido entre 15 y 100";
    }
    if (
      isNaN(Number(obj.semestre_actual)) ||
      Number(obj.semestre_actual) < 1 ||
      Number(obj.semestre_actual) > 12
    ) {
      return "El semestre debe ser un número válido entre 1 y 12";
    }
    // Email simple
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(obj.correo_institucional)) {
      return "El correo institucional no tiene un formato válido";
    }
    return null;
  }

  // Validar campos requeridos para profesor
  function validarProfesor(obj: any) {
    const camposObligatorios = [
      "nombre_completo",
      "correo_institucional",
      "edad",
      "password",
    ];
    for (const campo of camposObligatorios) {
      if (
        obj[campo] === undefined ||
        obj[campo] === null ||
        obj[campo].toString().trim() === ""
      ) {
        return `Falta el campo obligatorio: ${campo}`;
      }
    }
    if (
      isNaN(Number(obj.edad)) ||
      Number(obj.edad) < 18 ||
      Number(obj.edad) > 100
    ) {
      return "La edad debe ser un número válido entre 18 y 100";
    }
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(obj.correo_institucional)) {
      return "El correo institucional no tiene un formato válido";
    }
    return null;
  }

  // Procesar archivo y crear alumnos en lote
  async function handleArchivoCarga(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoCarga(file);

    let alumnosBatch: any[] = [];
    let errorArchivo: string | null = null;

    try {
      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (result) => {
            alumnosBatch = result.data;
            errorArchivo = await crearAlumnosBatch(alumnosBatch);
            if (errorArchivo) alert(errorArchivo);
          },
        });
      } else if (file.name.endsWith(".json")) {
        const text = await file.text();
        alumnosBatch = JSON.parse(text);
        errorArchivo = await crearAlumnosBatch(alumnosBatch);
        if (errorArchivo) alert(errorArchivo);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        alumnosBatch = XLSX.utils.sheet_to_json(sheet);
        errorArchivo = await crearAlumnosBatch(alumnosBatch);
        if (errorArchivo) alert(errorArchivo);
      } else {
        alert(
          "Formato de archivo no soportado. Solo se permiten .csv, .json, .xlsx, .xls"
        );
      }
    } catch (err: any) {
      alert("Error al procesar el archivo: " + err.message);
    }
  }

  // Crear alumnos en lote con validación
  async function crearAlumnosBatch(alumnos: any[]): Promise<string | null> {
    if (!Array.isArray(alumnos) || alumnos.length === 0) {
      return "El archivo no contiene registros válidos.";
    }
    // Validar cada alumno
    for (let i = 0; i < alumnos.length; i++) {
      const error = validarAlumno(alumnos[i]);
      if (error) {
        return `Error en el registro ${i + 1}: ${error}`;
      }
    }
    const supabase = createClient();
    setLoading(true);
    const alumnosFormateados = alumnos.map((a) => ({
      nombre_completo: a.nombre_completo.trim(),
      correo_institucional: a.correo_institucional.trim(),
      edad: Number(a.edad),
      matricula: a.matricula.trim(),
      semestre_actual: Number(a.semestre_actual),
      materias_aprobadas: 0,
      materias_en_recurso: 0,
      foto_credencial: null,
      password_hash: a.password ? a.password.trim() : "123456",
      fecha_inscripcion: new Date().toISOString().slice(0, 10),
      carrera_id: null,
    }));
    const { error } = await supabase.from("alumnos").insert(alumnosFormateados);
    setLoading(false);
    if (error) {
      return "Error al cargar alumnos: " + error.message;
    }
    alert("Alumnos cargados correctamente");
    setTimeout(() => window.location.reload(), 500);
    return null;
  }

  // Procesar archivo y crear profesores en lote
  async function handleArchivoCargaProfesores(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoCarga(file);

    let profesoresBatch: any[] = [];
    let errorArchivo: string | null = null;

    try {
      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (result) => {
            profesoresBatch = result.data;
            errorArchivo = await crearProfesoresBatch(profesoresBatch);
            if (errorArchivo) alert(errorArchivo);
          },
        });
      } else if (file.name.endsWith(".json")) {
        const text = await file.text();
        profesoresBatch = JSON.parse(text);
        errorArchivo = await crearProfesoresBatch(profesoresBatch);
        if (errorArchivo) alert(errorArchivo);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        profesoresBatch = XLSX.utils.sheet_to_json(sheet);
        errorArchivo = await crearProfesoresBatch(profesoresBatch);
        if (errorArchivo) alert(errorArchivo);
      } else {
        alert(
          "Formato de archivo no soportado. Solo se permiten .csv, .json, .xlsx, .xls"
        );
      }
    } catch (err: any) {
      alert("Error al procesar el archivo: " + err.message);
    }
  }

  // Crear profesores en lote con validación
  async function crearProfesoresBatch(
    profesores: any[]
  ): Promise<string | null> {
    if (!Array.isArray(profesores) || profesores.length === 0) {
      return "El archivo no contiene registros válidos.";
    }
    for (let i = 0; i < profesores.length; i++) {
      const error = validarProfesor(profesores[i]);
      if (error) {
        return `Error en el registro ${i + 1}: ${error}`;
      }
    }
    const supabase = createClient();
    setLoading(true);
    const profesoresFormateados = profesores.map((p) => ({
      nombre_completo: p.nombre_completo.trim(),
      correo_institucional: p.correo_institucional.trim(),
      edad: Number(p.edad),
      foto_perfil: null,
      password_hash: p.password ? p.password.trim() : "123456",
    }));
    const { error } = await supabase
      .from("profesores")
      .insert(profesoresFormateados);
    setLoading(false);
    if (error) {
      return "Error al cargar profesores: " + error.message;
    }
    alert("Profesores cargados correctamente");
    setTimeout(() => window.location.reload(), 500);
    return null;
  }

  // Abrir modal de ver/editar
  const handleVerUsuario = (usuario: Usuario, tipo: "alumno" | "profesor") => {
    setUsuarioSeleccionado(usuario);
    setModoDialogo("ver");
    setFormData(usuario);
    setErrorForm(null);
  };
  const handleEditarUsuarioModal = (
    usuario: Usuario,
    tipo: "alumno" | "profesor"
  ) => {
    setUsuarioSeleccionado(usuario);
    setModoDialogo("editar");
    setFormData(usuario);
    setErrorForm(null);
  };

  // Guardar cambios de edición
  const handleGuardarEdicion = async () => {
    setErrorForm(null);
    // Validar datos
    let error;
    if (tipoUsuario === "alumno") {
      error = validarAlumno(formData);
    } else {
      error = validarProfesor(formData);
    }
    if (error) {
      setErrorForm(error);
      return;
    }
    try {
      await handleEditarUsuario(usuarioSeleccionado!.id, formData, tipoUsuario);
      setModoDialogo(null);
      setUsuarioSeleccionado(null);
    } catch (e: any) {
      setErrorForm("Error al guardar: " + (e.message || "Error desconocido"));
    }
  };

  // Eliminar usuario con confirmación
  const handleEliminarUsuarioConfirm = async () => {
    try {
      await handleEliminarUsuario(usuarioSeleccionado!.id, tipoUsuario);
      setConfirmarEliminar(false);
      setModoDialogo(null);
      setUsuarioSeleccionado(null);
    } catch (e: any) {
      setErrorForm("Error al eliminar: " + (e.message || "Error desconocido"));
    }
  };

  // Indicador visual de tipo de usuario
  function TipoUsuarioBadge({ tipo }: { tipo: "alumno" | "profesor" }) {
    return (
      <span
        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
          tipo === "alumno"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {tipo === "alumno" ? "Alumno" : "Profesor"}
      </span>
    );
  }

  /**
   * Formulario para ver el perfil de un alumno.
   * Muestra los datos principales del alumno en modo solo lectura.
   * Tipo de usuario: alumno.
   */
  function VerPerfilAlumno({
    usuario,
    onClose,
  }: {
    usuario: Usuario;
    onClose: () => void;
  }) {
    return (
      <form className="space-y-4">
        <div className="flex gap-4 items-center">
          <Avatar className="h-16 w-16 border-2 border-blue-300">
            <AvatarImage src={usuario.foto_perfil || "/placeholder.svg"} />
            <AvatarFallback>
              {usuario.nombre_completo
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg">{usuario.nombre_completo}</h2>
            <TipoUsuarioBadge tipo="alumno" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Matrícula</Label>
            <Input value={usuario.matricula || ""} disabled />
          </div>
          <div>
            <Label>Correo institucional</Label>
            <Input value={usuario.correo_institucional || ""} disabled />
          </div>
          <div>
            <Label>Edad</Label>
            <Input value={usuario.edad || ""} disabled />
          </div>
          <div>
            <Label>Semestre actual</Label>
            <Input value={usuario.semestre_actual || ""} disabled />
          </div>
          <div>
            <Label>Materias aprobadas</Label>
            <Input value={usuario.materias_aprobadas || 0} disabled />
          </div>
          <div>
            <Label>Materias en recurso</Label>
            <Input value={usuario.materias_en_recurso || 0} disabled />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </form>
    );
  }

  /**
   * Formulario para ver el perfil de un profesor.
   * Muestra los datos principales del profesor en modo solo lectura.
   * Tipo de usuario: profesor.
   */
  function VerPerfilProfesor({
    usuario,
    onClose,
  }: {
    usuario: Usuario;
    onClose: () => void;
  }) {
    return (
      <form className="space-y-4">
        <div className="flex gap-4 items-center">
          <Avatar className="h-16 w-16 border-2 border-green-300">
            <AvatarImage src={usuario.foto_perfil || "/placeholder.svg"} />
            <AvatarFallback>
              {usuario.nombre_completo
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg">{usuario.nombre_completo}</h2>
            <TipoUsuarioBadge tipo="profesor" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Correo institucional</Label>
            <Input value={usuario.correo_institucional || ""} disabled />
          </div>
          <div>
            <Label>Edad</Label>
            <Input value={usuario.edad || ""} disabled />
          </div>
          <div>
            <Label>Grupos actuales</Label>
            <Input value={usuario.grupos_actuales || 0} disabled />
          </div>
          <div>
            <Label>Foto de perfil</Label>
            <Input value={usuario.foto_perfil || ""} disabled />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </form>
    );
  }

  /**
   * Formulario para editar los datos de un alumno.
   * Permite modificar los campos relevantes del alumno.
   * Tipo de usuario: alumno.
   */
  function EditarAlumnoForm({
    usuario,
    formData,
    setFormData,
    errorForm,
    onSubmit,
    onClose,
  }: {
    usuario: Usuario;
    formData: Partial<Usuario>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Usuario>>>;
    errorForm: string | null;
    onSubmit: () => void;
    onClose: () => void;
  }) {
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex gap-4 items-center">
          <Avatar className="h-16 w-16 border-2 border-blue-300">
            <AvatarImage src={usuario.foto_perfil || "/placeholder.svg"} />
            <AvatarFallback>
              {usuario.nombre_completo
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg">Editar alumno</h2>
            <TipoUsuarioBadge tipo="alumno" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nombre completo</Label>
            <Input
              value={formData.nombre_completo || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, nombre_completo: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label>Matrícula</Label>
            <Input
              value={formData.matricula || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, matricula: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label>Correo institucional</Label>
            <Input
              value={formData.correo_institucional || ""}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  correo_institucional: e.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <Label>Edad</Label>
            <Input
              type="number"
              value={formData.edad || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, edad: Number(e.target.value) }))
              }
              required
              min={15}
              max={100}
            />
          </div>
          <div>
            <Label>Semestre actual</Label>
            <Input
              type="number"
              value={formData.semestre_actual || ""}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  semestre_actual: Number(e.target.value),
                }))
              }
              required
              min={1}
              max={12}
            />
          </div>
          <div>
            <Label>Materias aprobadas</Label>
            <Input
              type="number"
              value={formData.materias_aprobadas || 0}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  materias_aprobadas: Number(e.target.value),
                }))
              }
              min={0}
            />
          </div>
          <div>
            <Label>Materias en recurso</Label>
            <Input
              type="number"
              value={formData.materias_en_recurso || 0}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  materias_en_recurso: Number(e.target.value),
                }))
              }
              min={0}
            />
          </div>
        </div>
        {errorForm && <p className="text-destructive text-sm">{errorForm}</p>}
        <DialogFooter>
          <Button type="submit">Guardar cambios</Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </form>
    );
  }

  /**
   * Formulario para editar los datos de un profesor.
   * Permite modificar los campos relevantes del profesor.
   * Tipo de usuario: profesor.
   */
  function EditarProfesorForm({
    usuario,
    formData,
    setFormData,
    errorForm,
    onSubmit,
    onClose,
  }: {
    usuario: Usuario;
    formData: Partial<Usuario>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Usuario>>>;
    errorForm: string | null;
    onSubmit: () => void;
    onClose: () => void;
  }) {
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex gap-4 items-center">
          <Avatar className="h-16 w-16 border-2 border-green-300">
            <AvatarImage src={usuario.foto_perfil || "/placeholder.svg"} />
            <AvatarFallback>
              {usuario.nombre_completo
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg">Editar profesor</h2>
            <TipoUsuarioBadge tipo="profesor" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nombre completo</Label>
            <Input
              value={formData.nombre_completo || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, nombre_completo: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label>Correo institucional</Label>
            <Input
              value={formData.correo_institucional || ""}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  correo_institucional: e.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <Label>Edad</Label>
            <Input
              type="number"
              value={formData.edad || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, edad: Number(e.target.value) }))
              }
              required
              min={18}
              max={100}
            />
          </div>
          <div>
            <Label>Foto de perfil</Label>
            <Input
              value={formData.foto_perfil || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, foto_perfil: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Grupos actuales</Label>
            <Input value={formData.grupos_actuales || 0} disabled />
          </div>
        </div>
        {errorForm && <p className="text-destructive text-sm">{errorForm}</p>}
        <DialogFooter>
          <Button type="submit">Guardar cambios</Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </form>
    );
  }

  /**
   * Formulario para confirmar la eliminación de un usuario (alumno o profesor).
   * Muestra advertencia y solicita confirmación antes de eliminar.
   * Tipo de usuario: alumno o profesor.
   */
  function EliminarUsuarioForm({
    usuario,
    tipoUsuario,
    onConfirm,
    onCancel,
  }: {
    usuario: Usuario;
    tipoUsuario: "alumno" | "profesor";
    onConfirm: () => void;
    onCancel: () => void;
  }) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <Avatar className="h-16 w-16 border-2 border-red-300">
            <AvatarImage src={usuario.foto_perfil || "/placeholder.svg"} />
            <AvatarFallback>
              {usuario.nombre_completo
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg text-red-700">
              ¿Eliminar {tipoUsuario === "alumno" ? "alumno" : "profesor"}?
            </h2>
            <TipoUsuarioBadge tipo={tipoUsuario} />
          </div>
        </div>
        <p>
          Esta acción{" "}
          <span className="font-bold text-red-600">no se puede deshacer</span>.
          ¿Seguro que deseas eliminar este{" "}
          {tipoUsuario === "alumno" ? "alumno" : "profesor"}?
        </p>
        <DialogFooter>
          <Button variant="destructive" onClick={onConfirm}>
            Eliminar
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogFooter>
      </div>
    );
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
                  {/* Botón para cargar archivo de alumnos */}
                  <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded hover:bg-primary/80">
                    Cargar archivo
                    <input
                      type="file"
                      accept=".csv,.json,.xlsx,.xls"
                      style={{ display: "none" }}
                      onChange={handleArchivoCarga}
                    />
                  </label>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerUsuario(alumno, "alumno")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditarUsuarioModal(alumno, "alumno")
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUsuarioSeleccionado(alumno);
                                setTipoUsuario("alumno");
                                setConfirmarEliminar(true);
                              }}
                            >
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
                  {/* Botón para cargar archivo de profesores */}
                  <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded hover:bg-primary/80">
                    Cargar archivo
                    <input
                      type="file"
                      accept=".csv,.json,.xlsx,.xls"
                      style={{ display: "none" }}
                      onChange={handleArchivoCargaProfesores}
                    />
                  </label>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleVerUsuario(profesor, "profesor")
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditarUsuarioModal(profesor, "profesor")
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUsuarioSeleccionado(profesor);
                                setTipoUsuario("profesor");
                                setConfirmarEliminar(true);
                              }}
                            >
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

      {/* Modal de ver/editar usuario */}
      <Dialog
        open={!!modoDialogo}
        onOpenChange={(v) => {
          if (!v) {
            setModoDialogo(null);
            setUsuarioSeleccionado(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modoDialogo === "ver"
                ? `Ver perfil de ${tipoUsuario}`
                : `Editar perfil de ${tipoUsuario}`}
            </DialogTitle>
            <DialogDescription>
              {modoDialogo === "ver"
                ? "Consulta los datos del usuario."
                : "Edita los datos y guarda cambios."}
            </DialogDescription>
          </DialogHeader>
          {usuarioSeleccionado &&
            modoDialogo === "ver" &&
            tipoUsuario === "alumno" && (
              <VerPerfilAlumno
                usuario={usuarioSeleccionado}
                onClose={() => {
                  setModoDialogo(null);
                  setUsuarioSeleccionado(null);
                }}
              />
            )}
          {usuarioSeleccionado &&
            modoDialogo === "ver" &&
            tipoUsuario === "profesor" && (
              <VerPerfilProfesor
                usuario={usuarioSeleccionado}
                onClose={() => {
                  setModoDialogo(null);
                  setUsuarioSeleccionado(null);
                }}
              />
            )}
          {usuarioSeleccionado &&
            modoDialogo === "editar" &&
            tipoUsuario === "alumno" && (
              <EditarAlumnoForm
                usuario={usuarioSeleccionado}
                formData={formData}
                setFormData={setFormData}
                errorForm={errorForm}
                onSubmit={handleGuardarEdicion}
                onClose={() => {
                  setModoDialogo(null);
                  setUsuarioSeleccionado(null);
                }}
              />
            )}
          {usuarioSeleccionado &&
            modoDialogo === "editar" &&
            tipoUsuario === "profesor" && (
              <EditarProfesorForm
                usuario={usuarioSeleccionado}
                formData={formData}
                setFormData={setFormData}
                errorForm={errorForm}
                onSubmit={handleGuardarEdicion}
                onClose={() => {
                  setModoDialogo(null);
                  setUsuarioSeleccionado(null);
                }}
              />
            )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={confirmarEliminar}
        onOpenChange={(v) => {
          if (!v) setConfirmarEliminar(false);
        }}
      >
        <DialogContent>
          {usuarioSeleccionado && (
            <EliminarUsuarioForm
              usuario={usuarioSeleccionado}
              tipoUsuario={tipoUsuario}
              onConfirm={handleEliminarUsuarioConfirm}
              onCancel={() => setConfirmarEliminar(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
