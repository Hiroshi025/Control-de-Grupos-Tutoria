"use client";

import { Clock, Mail } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/auth-client";

interface InfoTutorProps {
  alumnoId: string;
}

interface TutorInfo {
  nombre_completo: string;
  correo_institucional: string;
  horario_tutoria?: string;
  foto_perfil?: string;
}

export function InfoTutor({ alumnoId }: InfoTutorProps) {
  const [tutor, setTutor] = useState<TutorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutor() {
      setLoading(true);
      const supabase = createClient();

      // 1. Buscar el grupo activo del alumno
      const { data: alumnoGrupo, error: errorAlumnoGrupo } = await supabase
        .from("alumno_grupo")
        .select("grupo_id")
        .eq("alumno_id", alumnoId)
        .eq("activo", true)
        .single();

      if (errorAlumnoGrupo || !alumnoGrupo) {
        setTutor(null);
        setLoading(false);
        return;
      }

      // 2. Buscar el profesor activo asignado al grupo
      const { data: profesorGrupo, error: errorProfesorGrupo } = await supabase
        .from("profesor_grupo")
        .select("profesor_id, grupo_id")
        .eq("grupo_id", alumnoGrupo.grupo_id)
        .eq("activo", true)
        .single();

      if (errorProfesorGrupo || !profesorGrupo) {
        setTutor(null);
        setLoading(false);
        return;
      }

      // 3. Obtener datos del profesor
      const { data: profesor, error: errorProfesor } = await supabase
        .from("profesores")
        .select("nombre_completo, correo_institucional, foto_perfil")
        .eq("id", profesorGrupo.profesor_id)
        .single();

      // 4. Obtener horario de tutoría del grupo
      const { data: grupo, error: errorGrupo } = await supabase
        .from("grupos")
        .select("horario_tutoria")
        .eq("id", profesorGrupo.grupo_id)
        .single();

      if (errorProfesor || !profesor) {
        setTutor(null);
        setLoading(false);
        return;
      }

      setTutor({
        nombre_completo: profesor.nombre_completo,
        correo_institucional: profesor.correo_institucional,
        foto_perfil: profesor.foto_perfil,
        horario_tutoria: grupo?.horario_tutoria || undefined,
      });
      setLoading(false);
    }

    fetchTutor();
  }, [alumnoId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tutor Asignado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tutor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tutor Asignado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay tutor asignado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutor Asignado</CardTitle>
        <CardDescription>Información de contacto y horarios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={tutor.foto_perfil || "/placeholder.svg"} />
            <AvatarFallback>
              {tutor.nombre_completo
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{tutor.nombre_completo}</p>
            <p className="text-sm text-muted-foreground">Profesor Tutor</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{tutor.correo_institucional}</span>
          </div>
          {tutor.horario_tutoria && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{tutor.horario_tutoria}</span>
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" className="w-full bg-transparent">
          <Mail className="h-4 w-4 mr-2" />
          Contactar Tutor
        </Button>
      </CardContent>
    </Card>
  );
}
