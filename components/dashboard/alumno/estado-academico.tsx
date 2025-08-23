"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { createClient } from "@/lib/auth-client";

import type { Alumno } from "@/lib/database";

interface EstadoAcademicoProps {
  alumnoId?: string;
  correo?: string;
}

export function EstadoAcademico({ alumnoId, correo }: EstadoAcademicoProps) {
  const [alumno, setAlumno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlumno() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        let query = supabase.from("alumnos").select("*").single();
        if (alumnoId) {
          query = supabase
            .from("alumnos")
            .select("*")
            .eq("id", alumnoId)
            .single();
        } else if (correo) {
          query = supabase
            .from("alumnos")
            .select("*")
            .eq("correo_institucional", correo)
            .single();
        }
        const { data, error } = await query;
        if (error || !data) {
          setError("No se pudo cargar el alumno");
        } else {
          setAlumno(data);
        }
      } catch (err) {
        setError("Error de conexión");
      }
      setLoading(false);
    }
    fetchAlumno();
  }, [alumnoId, correo]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado Académico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !alumno) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado Académico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-destructive">
            {error || "Alumno no encontrado"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    {
      name: "Aprobadas",
      value: alumno.materias_aprobadas,
      color: "hsl(var(--chart-1))",
    },
    {
      name: "En Recurso",
      value: alumno.materias_en_recurso,
      color: "hsl(var(--destructive))",
    },
    {
      name: "Sin Cursar",
      value: alumno.materias_sin_cursar,
      color: "hsl(var(--chart-3))",
    },
    {
      name: "Especial",
      value: alumno.materias_en_especial,
      color: "hsl(var(--chart-4))",
    },
  ];

  const barData = [
    { name: "Aprobadas", value: alumno.materias_aprobadas },
    { name: "Recurso", value: alumno.materias_en_recurso },
    { name: "Sin Cursar", value: alumno.materias_sin_cursar },
    { name: "Especial", value: alumno.materias_en_especial },
  ];

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado Académico</CardTitle>
        <CardDescription>Distribución de materias por estado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gráfico de Dona */}
          <div className="space-y-4">
            <ChartContainer
              config={{
                aprobadas: { label: "Aprobadas", color: "hsl(var(--chart-1))" },
                recurso: {
                  label: "En Recurso",
                  color: "hsl(var(--destructive))",
                },
                sinCursar: {
                  label: "Sin Cursar",
                  color: "hsl(var(--chart-3))",
                },
                especial: { label: "Especial", color: "hsl(var(--chart-4))" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="text-center">
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Total de Materias</p>
            </div>
          </div>

          {/* Estadísticas Numéricas */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-chart-1/10 rounded-lg">
                <p className="text-2xl font-bold text-chart-1">
                  {alumno.materias_aprobadas}
                </p>
                <p className="text-sm text-muted-foreground">Aprobadas</p>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">
                  {alumno.materias_en_recurso}
                </p>
                <p className="text-sm text-muted-foreground">En Recurso</p>
              </div>
              <div className="text-center p-4 bg-chart-3/10 rounded-lg">
                <p className="text-2xl font-bold text-chart-3">
                  {alumno.materias_sin_cursar}
                </p>
                <p className="text-sm text-muted-foreground">Sin Cursar</p>
              </div>
              <div className="text-center p-4 bg-chart-4/10 rounded-lg">
                <p className="text-2xl font-bold text-chart-4">
                  {alumno.materias_en_especial}
                </p>
                <p className="text-sm text-muted-foreground">Especial</p>
              </div>
            </div>

            {/* Gráfico de Barras */}
            <ChartContainer
              config={{
                value: { label: "Materias", color: "hsl(var(--primary))" },
              }}
              className="h-[120px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
