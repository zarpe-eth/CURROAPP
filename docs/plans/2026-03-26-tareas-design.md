# Modulo de Tareas Design

**Date:** 2026-03-26

## Objetivo
Añadir un modulo interno de tareas para profesionalizar el traspaso de incidencias desde admin hacia el empleado, sustituyendo el envio informal por WhatsApp por un flujo visual dentro de la app.

## Decisiones clave
- Solo el admin puede crear tareas.
- El empleado puede ver sus tareas asignadas y cambiar su estado entre `pending`, `in_progress` y `done`.
- La vista principal combina tablero visual por columnas y lista inferior con busqueda/filtros.
- La primera version evita comentarios, adjuntos, subtareas y asignacion multiple para mantener el flujo simple y claro.
- El modelo de datos se resuelve con una nueva tabla `tasks` en Supabase, protegida con RLS por rol.

## UX
- Nueva entrada `Tareas` en la barra lateral para admin y empleado.
- Cabecera con resumen rapido de volumen por estado.
- Formulario de alta visible solo para admin con titulo, descripcion y prioridad.
- Tablero superior con columnas `Pendiente`, `En curso` y `Hecha`.
- Lista inferior con buscador de texto, filtro por estado y orden por mas recientes.
- El empleado ve y actualiza solo sus tareas. El admin ve todas las tareas y puede supervisar el estado completo.

## Seguridad
- RLS permite al admin leer y crear cualquier tarea.
- El empleado solo puede leer tareas donde `assigned_to = auth.uid()`.
- El empleado no puede editar titulo, descripcion ni prioridad; solo cambiar el estado de sus tareas.
- Las acciones server validan rol y limitan las operaciones antes de llegar a la base de datos.

## Alcance inicial
- Nueva tabla `tasks` con tipos y migracion.
- Pagina protegida `Tareas`.
- Formulario de creacion solo admin.
- Tablero visual por estado.
- Lista con filtros y busqueda.
- Cambio de estado sin recarga completa.
