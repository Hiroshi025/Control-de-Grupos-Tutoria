import { createBrowserClient } from "@supabase/ssr";

export type UserType = "alumno" | "profesor" | "administrador";

export interface AuthUser {
  id: string;
  email: string;
  userType: UserType;
  profile: any;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Función para establecer cookies de sesión
function setSessionCookie(user: AuthUser, maxAge: number = 30 * 24 * 60 * 60) {
  const cookieName =
    user.userType === "administrador" ? "admin_session" : "user_session";
  const cookieValue = JSON.stringify(user);
  document.cookie = `${cookieName}=${encodeURIComponent(
    cookieValue
  )}; max-age=${maxAge}; path=/; secure; samesite=lax`;
}

// Función para eliminar cookies de sesión
function clearSessionCookies() {
  document.cookie = "user_session=; max-age=0; path=/;";
  document.cookie = "admin_session=; max-age=0; path=/;";
}

export async function signInWithCredentials(
  identifier: string,
  password: string,
  userType: UserType
): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = createClient();

  try {
    console.log(`Intentando login: ${identifier}, tipo: ${userType}`);
    
    let result;
    if (userType === "administrador") {
      result = await signInAdmin(identifier, password);
    } else if (userType === "alumno") {
      result = await signInAlumno(identifier, password);
    } else if (userType === "profesor") {
      result = await signInProfesor(identifier, password);
    } else {
      return { user: null, error: "Tipo de usuario no soportado" };
    }

    if (result.user) {
      console.log("Login exitoso:", result.user.email);
      setSessionCookie(result.user);
      return { user: result.user, error: null };
    } else {
      console.log("Error de login:", result.error);
      return { user: null, error: result.error };
    }
  } catch (error) {
    console.error("Error en signInWithCredentials:", error);
    return { user: null, error: "Error de conexión con el servidor" };
  }
}

async function signInAdmin(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = createClient();

  try {
    console.log("Verificando administrador:", email);

    const { data: admin, error } = await supabase.rpc("verify_admin_password", {
      p_email: String(email), // Asegurar que es string
      p_password: String(password), // Asegurar que es string
    });

    if (error) {
      console.error("Error RPC administrador:", error);
      return { user: null, error: "Error del servidor: " + error.message };
    }

    console.log("Resultado RPC administrador:", admin);

    if (!admin || admin.length === 0) {
      console.log("Administrador no encontrado o credenciales incorrectas");
      return { user: null, error: "Credenciales incorrectas" };
    }

    const adminUser: AuthUser = {
      id: admin[0].id,
      email: admin[0].correo_institucional,
      userType: "administrador",
      profile: admin[0],
    };

    return { user: adminUser, error: null };
  } catch (error) {
    console.error("Error en signInAdmin:", error);
    return { user: null, error: "Error de conexión" };
  }
}

// Aplicar el mismo patrón a signInAlumno y signInProfesor
async function signInAlumno(
  matriculaOEmail: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = createClient();

  try {
    console.log("Verificando alumno:", matriculaOEmail);

    const { data: alumno, error } = await supabase.rpc(
      "verify_alumno_password",
      {
        p_identifier: String(matriculaOEmail), // Asegurar string
        p_password: String(password), // Asegurar string
      }
    );

    if (error) {
      console.error("Error RPC alumno:", error);
      return { user: null, error: "Error del servidor: " + error.message };
    }

    if (!alumno || alumno.length === 0) {
      console.log("Alumno no encontrado o credenciales incorrectas");
      return { user: null, error: "Credenciales incorrectas" };
    }

    const alumnoUser: AuthUser = {
      id: alumno[0].id,
      email: alumno[0].correo_institucional,
      userType: "alumno",
      profile: alumno[0],
    };

    return { user: alumnoUser, error: null };
  } catch (error) {
    console.error("Error en signInAlumno:", error);
    return { user: null, error: "Error de conexión" };
  }
}

async function signInProfesor(
  identifier: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = createClient();
  // Puede ser email o algún identificador
  const { data: profesor, error } = await supabase.rpc(
    "verify_profesor_password",
    {
      p_email: identifier,
      p_password: password,
    }
  );

  if (error || !profesor) {
    return { user: null, error: "Credenciales incorrectas" };
  }

  const { data: profile } = await supabase
    .from("profesores")
    .select("*")
    .eq("correo_institucional", identifier)
    .single();

  if (!profile) {
    return { user: null, error: "Profesor no encontrado" };
  }

  const profesorUser: AuthUser = {
    id: profile.id,
    email: profile.correo_institucional,
    userType: "profesor",
    profile,
  };

  return { user: profesorUser, error: null };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  // Leer de cookies en lugar de localStorage
  if (typeof window !== "undefined") {
    try {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "user_session" || name === "admin_session") {
          return JSON.parse(decodeURIComponent(value));
        }
      }
    } catch (error) {
      console.error("Error reading user from cookies:", error);
      clearSessionCookies();
    }
  }
  return null;
}

export async function signOut() {
  // Limpiar cookies de manera más agresiva
  if (typeof window !== "undefined") {
    // Limpiar todas las cookies de sesión posibles
    document.cookie =
      "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // También limpiar localStorage
    localStorage.removeItem("admin_session");
    localStorage.removeItem("user_session");
    localStorage.removeItem("current_user_type");
  }

  const supabase = createClient();
  await supabase.auth.signOut();
}

async function getUserProfile(email: string, userType: UserType) {
  const supabase = createClient();

  switch (userType) {
    case "alumno":
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("*")
        .eq("correo_institucional", email)
        .single();
      return alumno;

    case "profesor":
      const { data: profesor } = await supabase
        .from("profesores")
        .select("*")
        .eq("correo_institucional", email)
        .single();
      return profesor;

    case "administrador":
      const { data: admin } = await supabase
        .from("administradores")
        .select("*")
        .eq("correo_institucional", email)
        .single();
      return admin;

    default:
      return null;
  }
}

async function determineUserType(email: string): Promise<UserType | null> {
  const supabase = createClient();

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("id")
    .eq("correo_institucional", email)
    .single();
  if (alumno) return "alumno";

  const { data: profesor } = await supabase
    .from("profesores")
    .select("id")
    .eq("correo_institucional", email)
    .single();
  if (profesor) return "profesor";

  const { data: admin } = await supabase
    .from("administradores")
    .select("id")
    .eq("correo_institucional", email)
    .single();
  if (admin) return "administrador";

  return null;
}
