"use client"

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Bell, Calendar, Check, GraduationCap, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Notificacion, notificationService } from "@/lib/notifications-client";

const iconMap = {
  reporte_academico: AlertCircle,
  mensaje: MessageSquare,
  cita_agendada: Calendar,
  alerta_servicio_social: GraduationCap,
  alerta_residencia: GraduationCap,
  alerta_riesgo_academico: AlertCircle,
  confirmacion_reporte: Check,
}

const priorityColors = {
  baja: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  alta: "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800",
}

export function NotificationCenter() {
  const { user } = useAuth()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      cargarNotificaciones()
      cargarConteoNoLeidas()
    }
  }, [user?.id])

  const cargarNotificaciones = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const data = await notificationService.obtenerNotificaciones(user.id)
      setNotificaciones(data)
    } catch (error) {
      console.error("Error cargando notificaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const cargarConteoNoLeidas = async () => {
    if (!user?.id) return

    try {
      const count = await notificationService.contarNoLeidas(user.id)
      setNoLeidas(count)
    } catch (error) {
      console.error("Error contando notificaciones:", error)
    }
  }

  const marcarComoLeida = async (notificacionId: string) => {
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
    } catch (error) {
      console.error("Error marcando notificación como leída:", error)
    }
  }

  const marcarTodasComoLeidas = async () => {
    const noLeidasIds = notificaciones.filter((n) => !n.leida).map((n) => n.id)

    try {
      await Promise.all(noLeidasIds.map((id) => notificationService.marcarComoLeida(id)))

      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true, fecha_lectura: new Date().toISOString() })))
      setNoLeidas(0)
    } catch (error) {
      console.error("Error marcando todas las notificaciones como leídas:", error)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {noLeidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {noLeidas > 99 ? "99+" : noLeidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificaciones</CardTitle>
              <div className="flex items-center gap-2">
                {noLeidas > 0 && (
                  <Button variant="ghost" size="sm" onClick={marcarTodasComoLeidas} className="text-xs">
                    Marcar todas como leídas
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Cargando notificaciones...</div>
              ) : notificaciones.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No tienes notificaciones</div>
              ) : (
                <div className="divide-y">
                  {notificaciones.map((notificacion) => {
                    const IconComponent = iconMap[notificacion.tipo as keyof typeof iconMap] || Bell

                    return (
                      <div
                        key={notificacion.id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          !notificacion.leida ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => !notificacion.leida && marcarComoLeida(notificacion.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${priorityColors[notificacion.prioridad]}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-sm font-medium truncate ${
                                  !notificacion.leida ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {notificacion.titulo}
                              </h4>
                              {!notificacion.leida && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notificacion.mensaje}</p>

                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notificacion.fecha_creacion), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
