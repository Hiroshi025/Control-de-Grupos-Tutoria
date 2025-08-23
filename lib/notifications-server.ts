import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  fecha_lectura?: string;
  datos_adicionales?: any;
  prioridad: "baja" | "normal" | "alta" | "critica";
}

export interface Mensaje {
  id: string;
  remitente_id: string;
  destinatario_id: string;
  asunto: string;
  contenido: string;
  leido: boolean;
  fecha_envio: string;
  fecha_lectura?: string;
  tipo_conversacion: "individual" | "grupal";
  remitente_nombre?: string;
}

export class NotificationService {
  private supabase;

  constructor() {
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookies().getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookies().set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );
  }

  async crearNotificacion(
    usuarioId: string,
    tipo: string,
    titulo: string,
    mensaje: string,
    prioridad: "baja" | "normal" | "alta" | "critica" = "normal",
    datosAdicionales?: any
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc("crear_notificacion", {
        p_usuario_id: usuarioId,
        p_tipo: tipo,
        p_titulo: titulo,
        p_mensaje: mensaje,
        p_prioridad: prioridad,
        p_datos_adicionales: datosAdicionales,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creando notificación:", error);
      return null;
    }
  }

  async obtenerNotificaciones(
    usuarioId: string,
    limite = 20
  ): Promise<Notificacion[]> {
    try {
      const { data, error } = await this.supabase
        .from("notificaciones")
        .select("*")
        .eq("usuario_id", usuarioId)
        .order("fecha_creacion", { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error obteniendo notificaciones:", error);
      return [];
    }
  }

  async marcarComoLeida(notificacionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc("marcar_notificacion_leida", {
        p_notificacion_id: notificacionId,
      });

      return !error;
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
      return false;
    }
  }

  async contarNoLeidas(usuarioId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("notificaciones")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", usuarioId)
        .eq("leida", false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error contando notificaciones no leídas:", error);
      return 0;
    }
  }

  async enviarMensaje(
    remitenteId: string,
    destinatarioId: string,
    asunto: string,
    contenido: string,
    tipoConversacion: "individual" | "grupal" = "individual"
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("mensajes")
        .insert({
          remitente_id: remitenteId,
          destinatario_id: destinatarioId,
          asunto,
          contenido,
          tipo_conversacion: tipoConversacion,
        })
        .select("id")
        .single();

      if (error) throw error;

      await this.crearNotificacion(
        destinatarioId,
        "mensaje",
        `Nuevo mensaje: ${asunto}`,
        `Has recibido un nuevo mensaje de ${remitenteId}`,
        "normal",
        { mensaje_id: data.id }
      );

      return data.id;
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      return null;
    }
  }

  async obtenerMensajes(usuarioId: string, limite = 20): Promise<Mensaje[]> {
    try {
      const { data, error } = await this.supabase
        .from("vista_mensajes_con_remitente")
        .select("*")
        .eq("destinatario_id", usuarioId)
        .order("fecha_envio", { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error obteniendo mensajes:", error);
      return [];
    }
  }

  async notificarReporteAcademico(
    alumnoId: string,
    tutorId: string,
    materias: string[],
    parcial: string
  ) {
    const materiasTexto = materias.join(", ");

    await this.crearNotificacion(
      tutorId,
      "reporte_academico",
      "Nuevo Reporte Académico",
      `Un alumno ha reportado materias reprobadas en el ${parcial}: ${materiasTexto}`,
      "alta",
      { alumno_id: alumnoId, materias, parcial }
    );

    await this.crearNotificacion(
      alumnoId,
      "confirmacion_reporte",
      "Reporte Enviado",
      `Tu reporte académico del ${parcial} ha sido enviado a tu tutor`,
      "normal",
      { materias, parcial }
    );
  }

  async notificarCitaAgendada(
    alumnoId: string,
    tutorId: string,
    fecha: string,
    tipo: string
  ) {
    const mensaje = `Se ha agendado una cita de tutoría ${tipo} para el ${fecha}`;

    await Promise.all([
      this.crearNotificacion(
        alumnoId,
        "cita_agendada",
        "Cita Agendada",
        mensaje,
        "normal"
      ),
      this.crearNotificacion(
        tutorId,
        "cita_agendada",
        "Nueva Cita",
        mensaje,
        "normal"
      ),
    ]);
  }

  async verificarAlertasAutomaticas(usuarioId: string, datosUsuario: any) {
    if (
      datosUsuario.semestre >= 8 &&
      !datosUsuario.servicio_social_completado
    ) {
      await this.crearNotificacion(
        usuarioId,
        "alerta_servicio_social",
        "Servicio Social Pendiente",
        "Recuerda que debes completar tu servicio social antes de graduarte",
        "alta"
      );
    }

    if (datosUsuario.semestre >= 9 && !datosUsuario.residencia_completada) {
      await this.crearNotificacion(
        usuarioId,
        "alerta_residencia",
        "Residencia Profesional Pendiente",
        "Es momento de iniciar tu residencia profesional",
        "critica"
      );
    }

    if (datosUsuario.materias_reprobadas >= 3) {
      await this.crearNotificacion(
        usuarioId,
        "alerta_riesgo_academico",
        "Riesgo Académico",
        "Tienes 3 o más materias reprobadas. Programa una cita con tu tutor",
        "critica"
      );
    }
  }
}

export const notificationService = new NotificationService();
