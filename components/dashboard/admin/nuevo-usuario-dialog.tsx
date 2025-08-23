"use client";

import { Save, User } from "lucide-react";
import { useState } from "react";

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

interface NuevoUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoUsuario: "alumno" | "profesor";
  onCrearUsuario: (
    data: {
      nombre_completo: string;
      correo_institucional: string;
      edad: string;
      matricula: string;
      semestre_actual: string;
      password: string;
    },
    tipo: "alumno" | "profesor"
  ) => void;
}

export function NuevoUsuarioDialog({
  open,
  onOpenChange,
  tipoUsuario,
  onCrearUsuario, // <-- Agrega esto aquí
}: NuevoUsuarioDialogProps) {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo_institucional: "",
    edad: "",
    matricula: "",
    semestre_actual: "",
    password: "",
  });
  const [guardando, setGuardando] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    setGuardando(true);

    await onCrearUsuario(formData, tipoUsuario); // <-- Llama aquí la función real

    setGuardando(false);
    onOpenChange(false);
    // Reset form
    setFormData({
      nombre_completo: "",
      correo_institucional: "",
      edad: "",
      matricula: "",
      semestre_actual: "",
      password: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Nuevo {tipoUsuario === "alumno" ? "Alumno" : "Profesor"}
          </DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo{" "}
            {tipoUsuario === "alumno" ? "alumno" : "profesor"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
              <CardDescription>Datos básicos del usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    placeholder="Nombre completo del usuario"
                    value={formData.nombre_completo}
                    onChange={(e) =>
                      handleInputChange("nombre_completo", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Edad</Label>
                  <Input
                    type="number"
                    placeholder="Edad"
                    value={formData.edad}
                    onChange={(e) => handleInputChange("edad", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Correo Institucional</Label>
                <Input
                  type="email"
                  placeholder="usuario@ITSOEH.edu.mx"
                  value={formData.correo_institucional}
                  onChange={(e) =>
                    handleInputChange("correo_institucional", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Contraseña Temporal</Label>
                <Input
                  type="password"
                  placeholder="Contraseña inicial"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {tipoUsuario === "alumno" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Académica</CardTitle>
                <CardDescription>Datos específicos del alumno</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Matrícula</Label>
                    <Input
                      placeholder="20240001"
                      value={formData.matricula}
                      onChange={(e) =>
                        handleInputChange("matricula", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Semestre Actual</Label>
                    <Select
                      value={formData.semestre_actual}
                      onValueChange={(value) =>
                        handleInputChange("semestre_actual", value)
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
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={
                guardando ||
                !formData.nombre_completo ||
                !formData.correo_institucional
              }
            >
              {guardando ? "Guardando..." : "Crear Usuario"}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
