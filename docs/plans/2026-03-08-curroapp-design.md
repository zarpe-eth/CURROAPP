# CURROAPP MVP Design

**Date:** 2026-03-08

## Objetivo
Aplicación web desktop-first para control de jornada de soporte (Javi), con autenticación por roles, control de tiempo efectivo con pausas, historial, resumen mensual y cálculo automático de dinero por tarifa/hora.

## Alcance MVP
- Login con email/password (Supabase Auth).
- Roles: `admin` y `employee`.
- Regla temporal de admin único por email: `silvestelar@gmail.com`.
- Registro de jornada con estados: activa, pausada, finalizada.
- Cronómetro en vivo de tiempo efectivo (no cuenta pausas).
- Dashboard con KPIs de hoy.
- Historial con filtro mensual.
- Resumen mensual con gráfico de barras (horas por día).
- Ajustes globales (tarifa, zona horaria, nombre visible) editables por admin.
- Preparación para integración futura con Tidio (`ticket_stats` + `lib/tidio`).

## Arquitectura
- Next.js 15 (App Router) + TypeScript.
- Tailwind + componentes base de shadcn/ui.
- Supabase (DB + Auth + RLS).
- Server Actions para mutaciones de jornada y ajustes.
- Cliente Supabase SSR para middleware y sesiones.

## Modelo de datos
- `profiles`: datos de usuario y rol.
- `work_sessions`: jornada principal.
- `work_breaks`: tramos de pausa por sesión.
- `app_settings`: configuración global.
- `ticket_stats`: métricas futuras Tidio.

## UX/UI
- Estilo minimalista claro y premium.
- Priorización visual desktop (pantallas grandes), responsive secundario.
- Jerarquía visual fuerte con tarjeta principal de estado + KPIs.

## Seguridad
- RLS por usuario/rol.
- Empleado: solo sus datos.
- Admin: acceso global + edición ajustes.

## No-MVP (futuro)
- Sincronización real con Tidio API.
- Gestión avanzada de múltiples admins.

