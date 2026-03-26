# Dashboard Timer + Productividad Design

**Date:** 2026-03-09

## Objetivo
Corregir el cronómetro en vivo para que siempre refleje tiempo real, añadir aviso único de 1 hora por sesión y ampliar la app con gestión manual de tickets diarios (admin) + estadísticas de productividad para todos.

## Decisiones clave
- Fuente de verdad del cronómetro: timestamps persistidos (`work_sessions.started_at`, `work_breaks`, `status`) y cálculo derivado en cada render, nunca contador acumulativo.
- Aviso de 1h: condición `elapsed >= 3600` + persistencia en DB (`work_sessions.one_hour_notified`) para idempotencia entre recargas/pestañas.
- Tickets diarios: nueva tabla `daily_ticket_stats` con `unique(user_id, stat_date)` y `upsert` desde acción server solo admin.
- Productividad: cálculo derivado desde sesiones + tickets por día/mes, con control de divisiones por cero y estados vacíos.

## UX
- `Equipo` pasa a ser espacio de productividad.
- Admin: formulario simple de carga manual + tabla + métricas + gráfico.
- Empleado: vista de solo lectura de sus métricas y detalle diario.

## Seguridad
- RLS en `daily_ticket_stats`: admin puede insertar/actualizar todos; empleado solo lectura propia.
- Acción de tickets valida rol admin en servidor.
- UI oculta controles de edición para empleado.
