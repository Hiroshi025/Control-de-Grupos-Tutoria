// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Interfaz para tu usuario personalizado
interface CustomUser {
  id: string;
  email: string;
  userType: "alumno" | "profesor" | "administrador";
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;
  console.log("Middleware ejecutándose para:", pathname);

  // Rutas públicas
  const publicRoutes = ["/", "/login"];
  if (publicRoutes.includes(pathname)) {
    return response;
  }

  // Verificar autenticación personalizada
  const user = await getCustomUserFromRequest(request);

  // Si no está autenticado y trata de acceder a dashboard, redirigir a login
  if (!user && pathname.startsWith("/dashboard")) {
    console.log("Usuario no autenticado, redirigiendo a login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado y trata de acceder a login, redirigir a su dashboard
  if (user && pathname === "/login") {
    console.log(
      "Usuario autenticado intentando acceder a login, redirigiendo a dashboard"
    );
    return NextResponse.redirect(
      new URL(`/dashboard/${user.userType}`, request.url)
    );
  }

  // Verificar que el usuario tenga acceso a la ruta específica
  if (user && pathname.startsWith("/dashboard")) {
    const requestedUserType = pathname.split("/")[2];

    if (requestedUserType && requestedUserType !== user.userType) {
      console.log(
        "Usuario no tiene acceso a esta ruta, redirigiendo a su dashboard"
      );
      return NextResponse.redirect(
        new URL(`/dashboard/${user.userType}`, request.url)
      );
    }
  }

  return response;
}

// Función para obtener el usuario desde tu autenticación personalizada
async function getCustomUserFromRequest(
  request: NextRequest
): Promise<CustomUser | null> {
  try {
    // Verificar si estamos en la ruta de login - forzar limpieza de sesiones viejas
    if (request.nextUrl.pathname === "/login") {
      // Limpiar cualquier cookie de sesión existente para evitar conflictos
      const response = NextResponse.next();
      response.cookies.delete("user_session");
      response.cookies.delete("admin_session");
      return null;
    }

    // 1. Verificar cookies de sesión personalizada
    const sessionCookie =
      request.cookies.get("user_session") ||
      request.cookies.get("admin_session");

    if (sessionCookie?.value) {
      try {
        const userData = JSON.parse(sessionCookie.value);
        console.log("Usuario encontrado en cookies:", userData.userType);
        return userData as CustomUser;
      } catch (e) {
        console.log("Error parsing session cookie:", e);
        // Limpiar cookie corrupta
        const response = NextResponse.next();
        response.cookies.delete("user_session");
        response.cookies.delete("admin_session");
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting custom user:", error);
    return null
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
};
