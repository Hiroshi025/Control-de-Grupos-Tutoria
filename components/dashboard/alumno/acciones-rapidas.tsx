import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar, History } from "lucide-react"

export function AccionesRapidas() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>Herramientas y funciones principales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Descargar Kardex
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
          <Calendar className="h-4 w-4" />
          Agendar Cita con Tutor
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
          <History className="h-4 w-4" />
          Ver Historial de Tutorías
        </Button>
      </CardContent>
    </Card>
  )
}
