"use client";

import { Calendar, GraduationCap, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { createClient } from "@/lib/auth-client";

interface EstadisticasData {
  totalAlumnos: number;
  totalProfesores: number;
  totalGrupos: number;
  totalSesiones: number;
  alumnosPorSemestre: Array<{ semestre: string; alumnos: number }>;
  distribucionSS: Array<{ name: string; value: number; color: string }>;
  sesionesPorMes: Array<{ mes: string; sesiones: number }>;
}

export function EstadisticasGenerales() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      // KPIs
      const { count: totalAlumnos } = await supabase
        .from("alumnos")
        .select("*", { count: "exact", head: true });
      const { count: totalProfesores } = await supabase
        .from("profesores")
        .select("*", { count: "exact", head: true });
      const { count: totalGrupos } = await supabase
        .from("grupos")
        .select("*", { count: "exact", head: true });
      const { count: totalSesiones } = await supabase
        .from("sesiones_tutoria")
        .select("*", { count: "exact", head: true });

      // Alumnos por semestre
      const { data: alumnosPorSemestreRaw } = await supabase
        .from("alumnos")
        .select("semestre_actual")
        .then((res) => res);

      const alumnosPorSemestre: Array<{ semestre: string; alumnos: number }> =
        [];
      if (alumnosPorSemestreRaw) {
        const counts: Record<string, number> = {};
        alumnosPorSemestreRaw.forEach((a: any) => {
          const s = String(a.semestre_actual);
          counts[s] = (counts[s] || 0) + 1;
        });
        Object.entries(counts).forEach(([semestre, alumnos]) =>
          alumnosPorSemestre.push({ semestre, alumnos })
        );
      }

      // Distribución Servicio Social
      const { data: ssRaw } = await supabase
        .from("alumnos")
        .select("servicio_social_realizado");
      let completado = 0,
        pendiente = 0;
      if (ssRaw) {
        ssRaw.forEach((a: any) => {
          if (a.servicio_social_realizado) completado++;
          else pendiente++;
        });
      }
      const distribucionSS = [
        { name: "Completado", value: completado, color: "hsl(var(--chart-1))" },
        { name: "Pendiente", value: pendiente, color: "hsl(var(--chart-2))" },
      ];

      // Sesiones por mes (últimos 12 meses)
      const { data: sesionesRaw } = await supabase
        .from("sesiones_tutoria")
        .select("fecha_sesion");
      const sesionesPorMes: Array<{ mes: string; sesiones: number }> = [];
      if (sesionesRaw) {
        const counts: Record<string, number> = {};
        sesionesRaw.forEach((s: any) => {
          const date = new Date(s.fecha_sesion);
          const mes = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          counts[mes] = (counts[mes] || 0) + 1;
        });
        Object.entries(counts)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([mes, sesiones]) => sesionesPorMes.push({ mes, sesiones }));
      }

      setEstadisticas({
        totalAlumnos: totalAlumnos ?? 0,
        totalProfesores: totalProfesores ?? 0,
        totalGrupos: totalGrupos ?? 0,
        totalSesiones: totalSesiones ?? 0,
        alumnosPorSemestre,
        distribucionSS,
        sesionesPorMes,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-80 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!estadisticas) return null;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {estadisticas.totalAlumnos}
                </p>
                <p className="text-sm text-muted-foreground">Total Alumnos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {estadisticas.totalProfesores}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Profesores
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estadisticas.totalGrupos}</p>
                <p className="text-sm text-muted-foreground">Grupos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {estadisticas.totalSesiones}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sesiones Registradas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      {/* Alumnos por Semestre en una fila completa */}
      <div className="grid md:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alumnos por Semestre</CardTitle>
            <CardDescription>
              Distribución de estudiantes por nivel académico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                alumnos: { label: "Alumnos", color: "hsl(var(--primary))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadisticas.alumnosPorSemestre}>
                  <XAxis dataKey="semestre" />
                  <YAxis />
                  <Bar
                    dataKey="alumnos"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      {/* Servicio Social y Sesiones de Tutoría en la siguiente fila */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Distribución Servicio Social */}
        <Card>
          <CardHeader>
            <CardTitle>Servicio Social</CardTitle>
            <CardDescription>
              Estado del servicio social en alumnos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completado: {
                  label: "Completado",
                  color: "hsl(var(--chart-1))",
                },
                pendiente: { label: "Pendiente", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadisticas.distribucionSS}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {estadisticas.distribucionSS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sesiones por Mes */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones de Tutoría</CardTitle>
            <CardDescription>
              Tendencia mensual de sesiones registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sesiones: { label: "Sesiones", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={estadisticas.sesionesPorMes}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Line
                    type="monotone"
                    dataKey="sesiones"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
