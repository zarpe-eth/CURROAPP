# CURROAPP

CURROAPP es un MVP `desktop-first` para controlar el tiempo de trabajo de soporte (Javi), con cálculo automático de horas y dinero por tarifa/hora.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (componentes base en `src/components/ui` + `components.json`)
- Supabase (Auth + PostgreSQL + RLS)
- Recharts (gráfico mensual)
- Preparado para Vercel

## Funcionalidades MVP

- Autenticación con email/contraseña (Supabase Auth)
- Roles `admin` y `employee`
- Jornada con estados: empezar, pausar, reanudar, terminar
- Cronómetro en vivo de tiempo efectivo (pausas excluidas)
- Dashboard con estado actual, horas hoy, dinero hoy y tarifa
- Selector de empleado para admin en dashboard/historial/resumen mensual
- Historial por mes
- Resumen mensual + gráfico de barras (horas por día)
- Ajustes globales (tarifa, zona horaria, nombre visible)
- Cambio de contraseña desde ajustes para cualquier usuario autenticado
- Estructura preparada para Tidio (`ticket_stats` + `src/lib/tidio/service.ts`)

## Requisitos

- Node.js 20+
- Proyecto en Supabase

## Configuración local

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno:

```bash
cp .env.example .env.local
```

Rellena en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Crear esquema en Supabase:

- Abre SQL Editor en Supabase.
- Ejecuta completo: `supabase/schema.sql`.

4. Levantar app:

```bash
npm run dev
```

App en `http://localhost:3000`.

## Flujo de usuarios

- `silvestelar@gmail.com` se asigna automáticamente como `admin` al registrarse.
- El resto se crea como `employee`.
- `employee`: solo ve y edita sus propios datos.
- `admin`: ve todos los datos y puede cambiar ajustes globales.

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run start
```

## Estructura principal

```txt
src/
  app/
    (auth)/login
    (protected)/dashboard
    (protected)/history
    (protected)/monthly
    (protected)/settings
  components/
    ui/
    dashboard/
    charts/
    layout/
  lib/
    actions/
    supabase/
    tidio/
    time/
  types/
supabase/schema.sql
```

## Despliegue en Vercel

1. Sube el repo a GitHub.
2. Importa el proyecto en Vercel.
3. Añade variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Notas de futuro (Tidio)

- `ticket_stats` ya existe en DB.
- `src/lib/tidio/service.ts` incluye tipos y punto de extensión para sincronización API.
- No se implementa todavía la ingesta real de Tidio en este MVP.

