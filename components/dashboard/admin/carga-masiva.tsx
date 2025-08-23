"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function CargaMasiva() {
  const [tipoImportacion, setTipoImportacion] = useState("")
  const [archivo, setArchivo] = useState<File | null>(null)
  const [progreso, setProgreso] = useState(0)
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState<{
    exitosos: number
    errores: number
    mensajes: string[]
  } | null>(null)

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setArchivo(file)
      setResultado(null)
    }
  }

  const handleImportar = async () => {
    if (!archivo || !tipoImportacion) return

    setImportando(true)
    setProgreso(0)
    setResultado(null)

    // Simular proceso de importación
    const interval = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setImportando(false)
          setResultado({
            exitosos: 45,
            errores: 3,
            mensajes: [
              "45 registros importados exitosamente",
              "3 registros con errores: correos duplicados en filas 12, 25, 38",
              "Proceso completado en 2.3 segundos",
            ],
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const descargarPlantilla = (tipo: string) => {
    // En una implementación real, esto descargaría un archivo CSV/Excel
    const plantillas = {
      alumnos: "plantilla_alumnos.xlsx",
      profesores: "plantilla_profesores.xlsx",
      calificaciones: "plantilla_calificaciones.xlsx",
    }

    console.log(`Descargando plantilla: ${plantillas[tipo as keyof typeof plantillas]}`)
  }

  return (
    <div className="space-y-6">
      {/* Selección de Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carga Masiva de Datos
          </CardTitle>
          <CardDescription>Importa información desde archivos Excel o CSV</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Importación</Label>
              <Select value={tipoImportacion} onValueChange={setTipoImportacion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de datos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alumnos">Importar Alumnos</SelectItem>
                  <SelectItem value="profesores">Importar Profesores</SelectItem>
                  <SelectItem value="calificaciones">Actualizar Calificaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descargar Plantilla</Label>
              <Button
                variant="outline"
                onClick={() => tipoImportacion && descargarPlantilla(tipoImportacion)}
                disabled={!tipoImportacion}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Archivo a Importar</Label>
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleArchivoChange} disabled={!tipoImportacion} />
            {archivo && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <Button onClick={handleImportar} disabled={!archivo || !tipoImportacion || importando} className="w-full">
            {importando ? "Importando..." : "Iniciar Importación"}
            <FileSpreadsheet className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Progreso de Importación */}
      {importando && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Procesando Archivo</CardTitle>
            <CardDescription>Importando datos, por favor espera...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progreso} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">{progreso}% completado</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado de Importación */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Importación Completada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold text-primary">{resultado.exitosos}</p>
                <p className="text-sm text-muted-foreground">Registros Exitosos</p>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">{resultado.errores}</p>
                <p className="text-sm text-muted-foreground">Registros con Errores</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Detalles del Proceso:</h4>
              {resultado.mensajes.map((mensaje, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{mensaje}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h4 className="font-medium mb-2">Selecciona el Tipo</h4>
                <p className="text-sm text-muted-foreground">
                  Elige qué tipo de datos vas a importar (alumnos, profesores, etc.)
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h4 className="font-medium mb-2">Descarga la Plantilla</h4>
                <p className="text-sm text-muted-foreground">
                  Usa la plantilla predefinida con las columnas correctas para evitar errores
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h4 className="font-medium mb-2">Sube tu Archivo</h4>
                <p className="text-sm text-muted-foreground">
                  Selecciona el archivo completado y ejecuta la importación
                </p>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Asegúrate de que los correos electrónicos sean únicos y que las matrículas
                no estén duplicadas. El sistema validará los datos antes de la importación.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
