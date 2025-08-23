import { Calendar, Hash, Mail } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { Alumno } from "@/lib/database";

interface AlumnoHeaderProps {
  alumno: Alumno;
}

export function AlumnoHeader({ alumno }: AlumnoHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={alumno.foto_credencial || "/placeholder.svg"} />
            <AvatarFallback className="text-lg">
              {(alumno.nombre_completo ?? "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {alumno.nombre_completo}
              </h1>
              <p className="text-muted-foreground">
                Estudiante de Ingeniería Electromecánica
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Matrícula:</span>
                <span>{alumno.matricula}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Semestre:</span>
                <Badge variant="secondary">{alumno.semestre_actual}°</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Correo:</span>
                <span>{alumno.correo_institucional}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
