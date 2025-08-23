"use client"

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Notificacion, notificationService } from "@/lib/notifications-client";

export function useNotifications() {
  const { user } = useAuth()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(false)

  const cargarNotificaciones = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const [notifs, count] = await Promise.all([
        notificationService.obtenerNotificaciones(user.id),
        notificationService.contarNoLeidas(user.id),
      ])

      setNotificaciones(notifs)
      setNoLeidas(count)
    } catch (error) {
      console.error("Error cargando notificaciones:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const marcarComoLeida = useCallback(async (notificacionId: string) => {
    try {
      const success = await notificationService.marcarComoLeida(notificacionId)
      if (success) {
        setNotificaciones((prev) =>
          prev.map((n) =>
            n.id === notificacionId ? { ...n, leida: true, fecha_lectura: new Date().toISOString() } : n,
          ),
        )
        setNoLeidas((prev) => Math.max(0, prev - 1))
      }
      return success
    } catch (error) {
      console.error("Error marcando notificación como leída:", error)
      return false
    }
  }, [])

  const crearNotificacion = useCallback(
    async (
      tipo: string,
      titulo: string,
      mensaje: string,
      prioridad: "baja" | "normal" | "alta" | "critica" = "normal",
      datosAdicionales?: any,
    ) => {
      if (!user?.id) return null

      try {
        const id = await notificationService.crearNotificacion(
          user.id,
          tipo,
          titulo,
          mensaje,
          prioridad,
          datosAdicionales,
        )

        if (id) {
          // Recargar notificaciones para mostrar la nueva
          await cargarNotificaciones()
        }

        return id
      } catch (error) {
        console.error("Error creando notificación:", error)
        return null
      }
    },
    [user?.id, cargarNotificaciones],
  )

  useEffect(() => {
    if (user?.id) {
      cargarNotificaciones()

      // Configurar polling cada 30 segundos para nuevas notificaciones
      const interval = setInterval(cargarNotificaciones, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id, cargarNotificaciones])

  return {
    notificaciones,
    noLeidas,
    loading,
    cargarNotificaciones,
    marcarComoLeida,
    crearNotificacion,
  }
}
