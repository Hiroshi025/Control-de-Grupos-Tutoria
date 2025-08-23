import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Briefcase, GraduationCap } from "lucide-react"
import type { Alumno } from "@/lib/database"

interface IndicadoresCriticosProps {
  alumno: Alumno
}

export function IndicadoresCriticos({ alumno }: IndicadoresCriticosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicadores Críticos</CardTitle>
        <CardDescription>Estado de requisitos importantes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Servicio Social</p>
              <p className="text-sm text-muted-foreground">Requisito de titulación</p>
            </div>
          </div>
          <Badge variant={alumno.servicio_social_realizado ? "default" : "destructive"} className="gap-1">
            {alumno.servicio_social_realizado ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {alumno.servicio_social_realizado ? "Completado" : "Pendiente"}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Residencia Profesional</p>
              <p className="text-sm text-muted-foreground">Requisito de titulación</p>
            </div>
          </div>
          <Badge variant={alumno.residencia_profesional_realizada ? "default" : "destructive"} className="gap-1">
            {alumno.residencia_profesional_realizada ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {alumno.residencia_profesional_realizada ? "Completado" : "Pendiente"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
