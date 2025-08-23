"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, User, GraduationCap } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ReportData {
  tipo: "tutor" | "alumno" | "constancia"
  usuario: {
    nombre: string
    matricula?: string
    email: string
    carrera?: string
    semestre?: number
  }
  periodo: {
    inicio: Date
    fin: Date
  }
  datos?: any
}

export function PDFGenerator({ reportData }: { reportData: ReportData }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      // Simular generación de PDF
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // En una implementación real, aquí se usaría una librería como jsPDF o react-pdf
      const pdfContent = generatePDFContent(reportData)

      // Crear blob y descargar
      const blob = new Blob([pdfContent], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${reportData.tipo}-${reportData.usuario.nombre}-${format(new Date(), "yyyy-MM-dd")}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generando PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePDFContent = (data: ReportData): string => {
    // Esta es una simulación. En producción se usaría jsPDF o similar
    return `
      INSTITUTO TECNOLÓGICO SUPERIOR DEL OCCIDENTE DEL ESTADO DE HIDALGO
      
      ${
        data.tipo === "tutor"
          ? "REPORTE DE ACTIVIDADES TUTORIALES"
          : data.tipo === "alumno"
            ? "REPORTE ACADÉMICO DEL ALUMNO"
            : "CONSTANCIA DE TUTORÍAS"
      }
      
      Nombre: ${data.usuario.nombre}
      ${data.usuario.matricula ? `Matrícula: ${data.usuario.matricula}` : ""}
      Email: ${data.usuario.email}
      ${data.usuario.carrera ? `Carrera: ${data.usuario.carrera}` : ""}
      ${data.usuario.semestre ? `Semestre: ${data.usuario.semestre}` : ""}
      
      Período: ${format(data.periodo.inicio, "dd/MM/yyyy", { locale: es })} - ${format(data.periodo.fin, "dd/MM/yyyy", { locale: es })}
      
      Fecha de generación: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
    `
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Generar Reporte PDF</CardTitle>
        </div>
        <CardDescription>
          {reportData.tipo === "tutor" && "Reporte de actividades tutoriales para la SEP"}
          {reportData.tipo === "alumno" && "Reporte académico detallado del alumno"}
          {reportData.tipo === "constancia" && "Constancia de participación en el programa de tutorías"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{reportData.usuario.nombre}</span>
          </div>

          {reportData.usuario.carrera && (
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>{reportData.usuario.carrera}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(reportData.periodo.inicio, "MMM yyyy", { locale: es })} -{" "}
              {format(reportData.periodo.fin, "MMM yyyy", { locale: es })}
            </span>
          </div>

          <Badge variant="secondary">
            {reportData.tipo === "tutor"
              ? "Reporte Tutor"
              : reportData.tipo === "alumno"
                ? "Reporte Alumno"
                : "Constancia"}
          </Badge>
        </div>

        <Button onClick={generatePDF} disabled={isGenerating} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "Generando PDF..." : "Descargar PDF"}
        </Button>
      </CardContent>
    </Card>
  )
}

// Componentes específicos para cada tipo de reporte
export function ReporteTutorPDF({ tutorId, periodo }: { tutorId: string; periodo: { inicio: Date; fin: Date } }) {
  const reportData: ReportData = {
    tipo: "tutor",
    usuario: {
      nombre: "Dr. Juan Pérez García",
      email: "juan.perez@itsoe.edu.mx",
    },
    periodo,
  }

  return <PDFGenerator reportData={reportData} />
}

export function ReporteAlumnoPDF({ alumnoId, periodo }: { alumnoId: string; periodo: { inicio: Date; fin: Date } }) {
  const reportData: ReportData = {
    tipo: "alumno",
    usuario: {
      nombre: "María González López",
      matricula: "20210001",
      email: "maria.gonzalez@itsoe.edu.mx",
      carrera: "Ingeniería en Sistemas Computacionales",
      semestre: 6,
    },
    periodo,
  }

  return <PDFGenerator reportData={reportData} />
}

export function ConstanciaTutoriasPDF({ alumnoId }: { alumnoId: string }) {
  const reportData: ReportData = {
    tipo: "constancia",
    usuario: {
      nombre: "María González López",
      matricula: "20210001",
      email: "maria.gonzalez@itsoe.edu.mx",
      carrera: "Ingeniería en Sistemas Computacionales",
      semestre: 6,
    },
    periodo: {
      inicio: new Date(2024, 0, 1),
      fin: new Date(2024, 11, 31),
    },
  }

  return <PDFGenerator reportData={reportData} />
}
