# Timer, Notificacion 1h y Productividad Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar cronómetro fiable, aviso único de 1 hora y módulo de tickets/productividad con permisos por rol.

**Architecture:** Reemplazar cronómetro acumulativo por cálculo derivado de timestamps persistidos. Añadir persistencia de notificación en `work_sessions` y nueva tabla `daily_ticket_stats` para captura manual admin. Construir métricas y visualizaciones desde funciones puras testeadas.

**Tech Stack:** Next.js App Router, TypeScript, Supabase (SQL + RLS), Recharts, Vitest.

---

### Task 1: Núcleo temporal y notificación (TDD)

**Files:**
- Create: `src/lib/time/live-session.test.ts`
- Create: `src/lib/time/live-session.ts`
- Modify: `src/components/dashboard/live-timer.tsx`
- Modify: `src/app/(protected)/dashboard/page.tsx`
- Modify: `src/lib/actions/sessions.ts`

1. Escribir tests fallidos para cálculo derivado e idempotencia del trigger de 1h.
2. Ejecutar `npm test -- src/lib/time/live-session.test.ts` y confirmar fallo.
3. Implementar utilidades de cálculo robustas (parse seguro de fechas ISO).
4. Refactor de `LiveTimer` para render periódico + cálculo `now - started_at`.
5. Añadir acción server para marcar `one_hour_notified` y usarla desde cliente.
6. Re-ejecutar tests del task.

### Task 2: Modelo de datos y permisos (SQL)

**Files:**
- Create: `supabase/migrations/20260309110000_productivity_and_notifications.sql`
- Modify: `supabase/schema.sql`
- Modify: `src/types/domain.ts`

1. Añadir `one_hour_notified boolean not null default false` a `work_sessions`.
2. Crear `daily_ticket_stats` + unique `(user_id, stat_date)` + índices.
3. Configurar RLS/policies para admin escritura global y empleado lectura propia.
4. Actualizar tipos TS.

### Task 3: Tickets y métricas de productividad (TDD)

**Files:**
- Create: `src/lib/productivity.test.ts`
- Create: `src/lib/productivity.ts`
- Create: `src/lib/actions/tickets.ts`
- Modify: `src/lib/data.ts`
- Modify: `src/app/(protected)/team/page.tsx`
- Modify: `src/components/layout/sidebar.tsx`
- Create: `src/components/charts/productivity-chart.tsx`

1. Escribir tests fallidos de métricas día/mes y divisiones por cero.
2. Ejecutar test focalizado y confirmar RED.
3. Implementar funciones puras de métricas.
4. Añadir lectura de tickets diarios y combinaciones con horas.
5. Implementar formulario admin de alta/edición (upsert) y tabla diaria.
6. Añadir tarjetas + gráfico + estados vacíos elegantes.
7. Re-ejecutar tests focalizados.

### Task 4: Verificación final

**Files:**
- Modify: `src/lib/data.test.ts` (si aplica)

1. Ejecutar `npm test`.
2. Ejecutar `npm run lint`.
3. Ejecutar `npm run build`.
4. Revisar diff final y validar requisitos funcionales.
