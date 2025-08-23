import { ArrowRight, Github, GraduationCap, Shield, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-primary">ITSOEH</h1>
                <p className="text-xs text-muted-foreground">
                  Sistema de Tutorías
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Instituto Tecnológico Superior del Occidente del Estado de Hidalgo
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Sistema de Control de{" "}
            <span className="text-primary">Estudiantes Tutorados</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Plataforma integral para la gestión y seguimiento académico de
            estudiantes de Ingeniería Electromecánica. Conecta alumnos,
            profesores y administradores en un sistema unificado de tutorías.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                Acceder al Sistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              Ver Tutorial
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un sistema completo diseñado para optimizar el proceso de tutorías
              académicas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Alumnos */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Para Alumnos</CardTitle>
                <CardDescription>
                  Acceso completo a tu información académica y herramientas de
                  seguimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    Estado académico visual con gráficos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    Seguimiento de Servicio Social y Residencia
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    Historial de tutorías y acuerdos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    Reporte proactivo de materias
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Profesores */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Para Profesores</CardTitle>
                <CardDescription>
                  Herramientas completas para la gestión de grupos y sesiones de
                  tutoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-secondary rounded-full" />
                    Gestión de múltiples grupos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-secondary rounded-full" />
                    Calendario de sesiones integrado
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-secondary rounded-full" />
                    Indicadores de riesgo académico
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-secondary rounded-full" />
                    Reportes grupales e individuales
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Administradores */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Para Administradores</CardTitle>
                <CardDescription>
                  Control total del sistema con herramientas de gestión
                  avanzadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                    Gestión completa de usuarios
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                    Asignación de tutores y grupos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                    Carga masiva de datos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                    Estadísticas y reportes generales
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tutorial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Cómo usar el sistema?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Guía paso a paso para comenzar a usar la plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  1
                </span>
              </div>
              <h3 className="font-semibold mb-2">Selecciona tu Perfil</h3>
              <p className="text-sm text-muted-foreground">
                Elige si eres Alumno, Profesor o Administrador en la página de
                login
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  2
                </span>
              </div>
              <h3 className="font-semibold mb-2">Inicia Sesión</h3>
              <p className="text-sm text-muted-foreground">
                Usa tu correo institucional (o matrícula si eres alumno) y
                contraseña
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  3
                </span>
              </div>
              <h3 className="font-semibold mb-2">Explora tu Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Accede a todas las funcionalidades específicas de tu rol
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  4
                </span>
              </div>
              <h3 className="font-semibold mb-2">Gestiona Información</h3>
              <p className="text-sm text-muted-foreground">
                Registra sesiones, consulta datos y mantén actualizada la
                información
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Sobre el Creador
            </h2>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Github className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Hiroshi025
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Desarrollador del Sistema de Control de Estudiantes
                    Tutorados para el Instituto Tecnológico Superior del
                    Occidente del Estado de Hidalgo.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Este sistema fue diseñado específicamente para optimizar la
                    gestión de tutorías académicas en la carrera de Ingeniería
                    Electromecánica, facilitando el seguimiento y control de
                    estudiantes tutorados.
                  </p>
                  <Button variant="outline" asChild>
                    <Link
                      href="https://github.com/Hiroshi025"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Ver en GitHub
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Accede al sistema y comienza a gestionar las tutorías académicas de
            manera eficiente
          </p>
          <Button size="lg" asChild>
            <Link href="/login">
              Iniciar Sesión Ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-primary">ITSOEH</h3>
                  <p className="text-xs text-muted-foreground">
                    Sistema de Tutorías
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Instituto Tecnológico Superior del Occidente del Estado de
                Hidalgo
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Accesos Rápidos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-primary transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link
                    href="#tutorial"
                    className="hover:text-primary transition-colors"
                  >
                    Tutorial de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Funcionalidades
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Información</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Carrera: Ingeniería Electromecánica</li>
                <li>Desarrollado por: Hiroshi025</li>
                <li>Año: 2024</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              © 2024 Instituto Tecnológico Superior del Occidente del Estado de
              Hidalgo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
