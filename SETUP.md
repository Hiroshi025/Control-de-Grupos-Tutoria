# Configuración del Sistema de Tutorías

## Variables de Entorno

1. Copia el archivo `.env.local.example` a `.env.local`
2. Completa las variables con tus valores reales de Supabase y base de datos

### Obtener las variables de Supabase:

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. En Settings > API encontrarás:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key (¡mantén esto secreto!)

### Variables de Base de Datos:

Si usas Supabase como base de datos, las variables de PostgreSQL serán las mismas que las de Supabase.
Si usas Neon u otro proveedor, obtén la cadena de conexión de tu panel de control.

### Configuración de Autenticación:

- `NEXTAUTH_SECRET`: Genera una clave secreta aleatoria
- `NEXTAUTH_URL`: URL de tu aplicación (http://localhost:3000 para desarrollo)

## Pasos de Instalación:

1. Instalar dependencias: `npm install`
2. Configurar variables de entorno (ver arriba)
3. Ejecutar scripts de base de datos en orden:
   - `scripts/01-create-database-schema.sql`
   - `scripts/02-seed-initial-data.sql`
   - `scripts/04-create-admin-user.sql`
   - `scripts/05-update-electromecanica-plan.sql`
   - `scripts/06-create-prerequisites.sql`
4. Iniciar el servidor: `npm run dev`

## Credenciales de Administrador por Defecto:

- Email: `21011073@itsoeh.edu.mx`
- Contraseña: `123456789`
