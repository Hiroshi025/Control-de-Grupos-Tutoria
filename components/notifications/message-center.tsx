"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, Send, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Mensaje, notificationService } from "@/lib/notifications-client";

export function MessageCenter() {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [noLeidos, setNoLeidos] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState({
    destinatario: "",
    asunto: "",
    contenido: "",
  });

  useEffect(() => {
    if (user?.id) {
      cargarMensajes();
    }
  }, [user?.id]);

  const cargarMensajes = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await notificationService.obtenerMensajes(user.id);
      setMensajes(data);
      setNoLeidos(data.filter((m) => !m.leido).length);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (
      !user?.id ||
      !nuevoMensaje.destinatario ||
      !nuevoMensaje.asunto ||
      !nuevoMensaje.contenido
    ) {
      return;
    }

    try {
      const mensajeId = await notificationService.enviarMensaje(
        user.id,
        nuevoMensaje.destinatario,
        nuevoMensaje.asunto,
        nuevoMensaje.contenido
      );

      if (mensajeId) {
        setNuevoMensaje({ destinatario: "", asunto: "", contenido: "" });
        cargarMensajes();
      }
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <MessageSquare className="h-5 w-5" />
            {noLeidos > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {noLeidos > 99 ? "99+" : noLeidos}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-96 p-0" align="end">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Mensajes</CardTitle>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nuevo Mensaje</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="ID del destinatario"
                          value={nuevoMensaje.destinatario}
                          onChange={(e) =>
                            setNuevoMensaje((prev) => ({
                              ...prev,
                              destinatario: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Asunto"
                          value={nuevoMensaje.asunto}
                          onChange={(e) =>
                            setNuevoMensaje((prev) => ({
                              ...prev,
                              asunto: e.target.value,
                            }))
                          }
                        />
                        <Textarea
                          placeholder="Contenido del mensaje"
                          value={nuevoMensaje.contenido}
                          onChange={(e) =>
                            setNuevoMensaje((prev) => ({
                              ...prev,
                              contenido: e.target.value,
                            }))
                          }
                          rows={4}
                        />
                        <Button onClick={enviarMensaje} className="w-full">
                          Enviar Mensaje
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Cargando mensajes...
                  </div>
                ) : mensajes.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No tienes mensajes
                  </div>
                ) : (
                  <div className="divide-y">
                    {mensajes.map((mensaje) => (
                      <div
                        key={mensaje.id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          !mensaje.leido ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <User className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-sm font-medium truncate ${
                                  !mensaje.leido
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {mensaje.asunto}
                              </h4>
                              {!mensaje.leido && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground">
                              De: {mensaje.remitente_nombre || "Usuario"}
                            </p>

                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {mensaje.contenido}
                            </p>

                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(
                                new Date(mensaje.fecha_envio),
                                {
                                  addSuffix: true,
                                  locale: es,
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </>
  );
}
