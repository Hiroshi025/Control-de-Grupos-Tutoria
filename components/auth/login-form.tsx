"use client";

import type React from "react";
import { Eye, EyeOff, GraduationCap, Shield, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { signInWithCredentials, UserType } from "@/lib/auth-client";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("alumno");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Iniciando proceso de login...");

    // Limpiar sesiones previas más agresivamente
    if (typeof window !== "undefined") {
      // Limpiar todas las cookies posibles
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      // Limpiar localStorage
      localStorage.clear();

      // Limpiar sessionStorage
      sessionStorage.clear();
    }

    try {
      const { user, error: signInError } = await signInWithCredentials(
        identifier.trim(),
        password,
        userType
      );

      if (signInError) {
        console.error("Error de autenticación:", signInError);
        setError(signInError);
        setLoading(false);
        return;
      }

      if (user) {
        console.log("✅ Usuario autenticado exitosamente:", user.email);

        // Pequeña pausa para asegurar que las cookies se establezcan
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Redirigir directamente
        window.location.href = `/dashboard/${user.userType}`;
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setError("Error inesperado. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (type: UserType) => {
    switch (type) {
      case "alumno":
        return <GraduationCap className="h-4 w-4" />;
      case "profesor":
        return <Users className="h-4 w-4" />;
      case "administrador":
        return <Shield className="h-4 w-4" />;
    }
  };

  const getPlaceholderText = () => {
    return userType === "alumno"
      ? "Correo o Matrícula"
      : "Correo Institucional";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Iniciar Sesión
        </CardTitle>
        <CardDescription>
          Sistema de Control de Estudiantes Tutorados - ITSOEH
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="userType">Tipo de Usuario</Label>
            <Select
              value={userType}
              onValueChange={(value: UserType) => setUserType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alumno">
                  <div className="flex items-center gap-2">
                    {getUserTypeIcon("alumno")}
                    Alumno
                  </div>
                </SelectItem>
                <SelectItem value="profesor">
                  <div className="flex items-center gap-2">
                    {getUserTypeIcon("profesor")}
                    Profesor
                  </div>
                </SelectItem>
                <SelectItem value="administrador">
                  <div className="flex items-center gap-2">
                    {getUserTypeIcon("administrador")}
                    Administrador
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identifier">
              {userType === "alumno"
                ? "Correo o Matrícula"
                : "Correo Institucional"}
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder={getPlaceholderText()}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground">
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
