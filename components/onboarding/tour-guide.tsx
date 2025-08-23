"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
}

interface TourGuideProps {
  steps: TourStep[]
  userType: "alumno" | "profesor" | "admin"
  onComplete: () => void
}

export function TourGuide({ steps, userType, onComplete }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Verificar si el usuario ya completó el tour
    const tourCompleted = localStorage.getItem(`tour-completed-${userType}`)
    if (!tourCompleted) {
      setIsVisible(true)
    }
  }, [userType])

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement
      setTargetElement(element)

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.style.position = "relative"
        element.style.zIndex = "1001"
        element.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.5)"
        element.style.borderRadius = "8px"
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.boxShadow = ""
        targetElement.style.zIndex = ""
      }
    }
  }, [currentStep, isVisible, steps, targetElement])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    localStorage.setItem(`tour-completed-${userType}`, "true")
    setIsVisible(false)
    onComplete()

    // Limpiar estilos del elemento actual
    if (targetElement) {
      targetElement.style.boxShadow = ""
      targetElement.style.zIndex = ""
    }
  }

  const skipTour = () => {
    completeTour()
  }

  if (!isVisible || !steps[currentStep]) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-1000" />

      {/* Tour Card */}
      <Card className="fixed z-1002 w-80 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {currentStep + 1} de {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">{steps[currentStep].description}</CardDescription>

          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
              {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={skipTour} className="w-full">
            Saltar tutorial
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

// Componente de ayuda contextual
export function ContextualHelp({ content, title }: { content: string; title?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Card className="absolute top-8 right-0 w-72 z-50 shadow-lg">
            <CardHeader className="pb-2">{title && <CardTitle className="text-sm">{title}</CardTitle>}</CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{content}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
