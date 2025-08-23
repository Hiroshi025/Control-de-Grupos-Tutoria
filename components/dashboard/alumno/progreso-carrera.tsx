import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Alumno } from "@/lib/database"

interface ProgresoCarreraProps {
  alumno: Alumno
}

export function ProgresoCarrera({ alumno }: ProgresoCarreraProps) {
  // Estimamos que una carrera de ingeniería tiene aproximadamente 50-60 materias
  const totalMateriasEstimadas = 55
  const totalMaterias =
    alumno.materias_aprobadas + alumno.materias_en_recurso + alumno.materias_sin_cursar + alumno.materias_en_especial
  const porcentajeProgreso = Math.round((alumno.materias_aprobadas / totalMateriasEstimadas) * 100)
  const porcentajeSemestre = Math.round((alumno.semestre_actual / 9) * 100) // 9 semestres típicos

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso de Carrera</CardTitle>
        <CardDescription>Avance en el plan de estudios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Materias Aprobadas</span>
            <span>{porcentajeProgreso}%</span>
          </div>
          <Progress value={porcentajeProgreso} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {alumno.materias_aprobadas} de ~{totalMateriasEstimadas} materias
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso por Semestre</span>
            <span>{porcentajeSemestre}%</span>
          </div>
          <Progress value={porcentajeSemestre} className="h-2" />
          <p className="text-xs text-muted-foreground">Semestre {alumno.semestre_actual} de 9</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{alumno.semestre_actual}</p>
            <p className="text-xs text-muted-foreground">Semestre Actual</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{9 - alumno.semestre_actual}</p>
            <p className="text-xs text-muted-foreground">Semestres Restantes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
