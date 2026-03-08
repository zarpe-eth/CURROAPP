# CURROAPP MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construir un MVP robusto de control de jornada con pausas, métricas y roles sobre Supabase.

**Architecture:** Aplicación Next.js App Router con páginas protegidas por sesión SSR de Supabase, lógica de negocio en server actions y consultas agregadas para dashboard/historial/resumen mensual.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Recharts, date-fns.

---

### Task 1: Base de proyecto y dependencias
- Ajustar proyecto a Next.js 15.
- Instalar dependencias UI/DB/helpers.
- Definir estructura de carpetas.

### Task 2: SQL y tipado de dominio
- Crear `supabase/schema.sql` con tablas, índices, funciones, triggers y RLS.
- Crear tipos TS de dominio para sesiones, pausas, métricas y ajustes.

### Task 3: Infraestructura Supabase SSR
- Clientes server/browser/middleware.
- Middleware de protección de rutas.
- Helpers de autenticación y autorización.

### Task 4: Lógica de tiempo y dinero
- Helpers puros para duración efectiva, formato y dinero.
- Casos límite (sesión activa, pausas abiertas, jornada sin fin).

### Task 5: Flujo de autenticación
- Página de login y acciones signin/signout.
- Redirecciones por sesión.

### Task 6: Dashboard y control de jornada
- Botones start/pause/resume/stop.
- Cronómetro en vivo y estado actual.
- KPIs hoy.

### Task 7: Historial y resumen mensual
- Historial filtrable por mes.
- Resumen mensual + gráfico barras por día.

### Task 8: Ajustes y rol admin
- Vista settings con edición restringida a admin.

### Task 9: Preparación Tidio y documentación
- `lib/tidio` placeholder.
- `.env.example` + README detallado local/Vercel/Supabase.

### Task 10: Verificación
- Ejecutar lint, build y pruebas.
- Ajustes finales para entrega.

