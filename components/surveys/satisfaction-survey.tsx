"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, Send, CheckCircle } from "lucide-react"

interface SurveyQuestion {
  id: string
  pregunta: string
  tipo: "rating" | "multiple" | "text"
  opciones?: string[]
  requerida: boolean
}

const surveyQuestions: SurveyQuestion[] = [
  {
    id: "satisfaccion-general",
    pregunta: "¿Qué tan satisfecho estás con el programa de tutorías en general?",
    tipo: "rating",
    requerida: true,
  },
  {
    id: "calidad-tutor",
    pregunta: "¿Cómo calificarías la calidad de tu tutor?",
    tipo: "rating",
    requerida: true,
  },
  {
    id: "frecuencia-sesiones",
    pregunta: "¿La frecuencia de las sesiones de tutoría fue adecuada?",
    tipo: "multiple",
    opciones: ["Muy adecuada", "Adecuada", "Poco adecuada", "Inadecuada"],
    requerida: true,
  },
  {
    id: "utilidad-tutorias",
    pregunta: "¿Las tutorías te ayudaron a mejorar tu rendimiento académico?",
    tipo: "multiple",
    opciones: ["Mucho", "Bastante", "Poco", "Nada"],
    requerida: true,
  },
  {
    id: "recomendacion",
    pregunta: "¿Recomendarías el programa de tutorías a otros estudiantes?",
    tipo: "multiple",
    opciones: ["Definitivamente sí", "Probablemente sí", "Probablemente no", "Definitivamente no"],
    requerida: true,
  },
  {
    id: "comentarios",
    pregunta: "¿Tienes algún comentario o sugerencia para mejorar el programa?",
    tipo: "text",
    requerida: false,
  },
]

export function SatisfactionSurvey({
  alumnoId,
  tutorId,
  onComplete,
}: {
  alumnoId: string
  tutorId: string
  onComplete: () => void
}) {
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Simular envío de encuesta
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Aquí se enviarían las respuestas a la base de datos
      console.log("Respuestas de encuesta:", {
        alumnoId,
        tutorId,
        responses,
        fecha: new Date(),
      })

      setIsCompleted(true)
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (error) {
      console.error("Error enviando encuesta:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    const requiredQuestions = surveyQuestions.filter((q) => q.requerida)
    return requiredQuestions.every((q) => responses[q.id])
  }

  if (isCompleted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">¡Encuesta Completada!</h3>
            <p className="text-sm text-muted-foreground">
              Gracias por tu retroalimentación. Tus respuestas nos ayudan a mejorar el programa.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Encuesta de Satisfacción</CardTitle>
            <CardDescription>Ayúdanos a mejorar el programa de tutorías con tu opinión</CardDescription>
          </div>
          <Badge variant="secondary">Fin de Semestre</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {surveyQuestions.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-muted-foreground mt-1">{index + 1}.</span>
              <div className="flex-1">
                <Label className="text-sm font-medium leading-relaxed">
                  {question.pregunta}
                  {question.requerida && <span className="text-red-500 ml-1">*</span>}
                </Label>

                <div className="mt-3">
                  {question.tipo === "rating" && (
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant={responses[question.id] === rating.toString() ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleResponseChange(question.id, rating.toString())}
                          className="w-10 h-10 p-0"
                        >
                          <Star
                            className={`h-4 w-4 ${responses[question.id] === rating.toString() ? "fill-current" : ""}`}
                          />
                        </Button>
                      ))}
                    </div>
                  )}

                  {question.tipo === "multiple" && (
                    <RadioGroup
                      value={responses[question.id] || ""}
                      onValueChange={(value) => handleResponseChange(question.id, value)}
                    >
                      {question.opciones?.map((opcion) => (
                        <div key={opcion} className="flex items-center space-x-2">
                          <RadioGroupItem value={opcion} id={`${question.id}-${opcion}`} />
                          <Label htmlFor={`${question.id}-${opcion}`} className="text-sm">
                            {opcion}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.tipo === "text" && (
                    <Textarea
                      placeholder="Escribe tus comentarios aquí..."
                      value={responses[question.id] || ""}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="min-h-[80px]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <Button onClick={handleSubmit} disabled={!isFormValid() || isSubmitting} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Enviando..." : "Enviar Encuesta"}
          </Button>

          {!isFormValid() && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              * Completa todas las preguntas requeridas para enviar la encuesta
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook para mostrar encuestas automáticamente
export function useSurveyTrigger(userType: "alumno" | "profesor", userId: string) {
  const [showSurvey, setShowSurvey] = useState(false)

  // Verificar si debe mostrar encuesta (fin de semestre)
  const checkSurveyTrigger = () => {
    const now = new Date()
    const month = now.getMonth()

    // Mostrar encuesta en diciembre (fin de semestre)
    if (month === 11) {
      const surveyCompleted = localStorage.getItem(`survey-completed-${userId}-${now.getFullYear()}`)
      if (!surveyCompleted) {
        setShowSurvey(true)
      }
    }
  }

  const completeSurvey = () => {
    const now = new Date()
    localStorage.setItem(`survey-completed-${userId}-${now.getFullYear()}`, "true")
    setShowSurvey(false)
  }

  return {
    showSurvey,
    checkSurveyTrigger,
    completeSurvey,
  }
}
