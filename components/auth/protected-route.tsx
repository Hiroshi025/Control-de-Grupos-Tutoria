"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import type { UserType } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserTypes: UserType[]
  fallbackPath?: string
}

export function ProtectedRoute({ children, allowedUserTypes, fallbackPath = "/login" }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(fallbackPath)
        return
      }

      if (!allowedUserTypes.includes(user.userType)) {
        // Redirigir al dashboard apropiado según el tipo de usuario
        switch (user.userType) {
          case "alumno":
            router.push("/dashboard/alumno")
            break
          case "profesor":
            router.push("/dashboard/profesor")
            break
          case "administrador":
            router.push("/dashboard/admin")
            break
        }
      }
    }
  }, [user, loading, allowedUserTypes, router, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !allowedUserTypes.includes(user.userType)) {
    return null
  }

  return <>{children}</>
}
