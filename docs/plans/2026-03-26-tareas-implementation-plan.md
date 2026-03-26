# Modulo de Tareas Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar un modulo de tareas interno para que el admin cree trabajo para Javi y el empleado gestione su avance por estados desde la propia app.

**Architecture:** Añadir una tabla `tasks` en Supabase con RLS para separar permisos de admin y empleado. Construir una pagina protegida `Tareas` con lectura server-side, formulario de alta solo admin y componentes cliente para actualizar estado, filtrar y visualizar el tablero y la lista en la misma vista.

**Tech Stack:** Next.js App Router, TypeScript, Supabase (SQL + RLS), Server Actions, Tailwind CSS, Vitest.

---

### Task 1: Modelo de datos y permisos de tareas

**Files:**
- Create: `supabase/migrations/20260326120000_add_tasks_module.sql`
- Modify: `supabase/schema.sql`
- Modify: `src/types/domain.ts`

**Step 1: Write the failing test**

Definir primero los tipos TS esperados para `Task`, `TaskStatus` y `TaskPriority` en el plan de codigo y comprobar que todavia no existen.

**Step 2: Run test to verify it fails**

Run: `cmd /c npx tsc --noEmit`
Expected: FAIL cuando se introduzcan referencias a tipos de tareas todavia no implementados.

**Step 3: Write minimal implementation**

- Crear migracion SQL para tabla `tasks`.
- Añadir indices por `assigned_to`, `status` y `created_at`.
- Activar RLS y policies:
  - admin: `select`, `insert`, `update`.
  - empleado: `select` de sus tareas y `update` solo de filas asignadas a si mismo.
- Actualizar `schema.sql`.
- Añadir tipos de dominio.

**Step 4: Run test to verify it passes**

Run: `cmd /c npx tsc --noEmit`
Expected: PASS para los nuevos tipos y referencias basicas.

**Step 5: Commit**

```bash
git add supabase/schema.sql supabase/migrations/20260326120000_add_tasks_module.sql src/types/domain.ts
git commit -m "feat: add task data model and permissions"
```

### Task 2: Acceso a datos y acciones server

**Files:**
- Modify: `src/lib/data.ts`
- Create: `src/lib/actions/tasks.ts`
- Create: `src/lib/tasks.test.ts`
- Modify: `src/lib/auth.ts` (si hace falta helper de permisos reutilizable)

**Step 1: Write the failing test**

Escribir tests para mapear tareas, agrupar conteos por estado y validar que solo se aceptan estados permitidos.

**Step 2: Run test to verify it fails**

Run: `cmd /c npm test -- src/lib/tasks.test.ts`
Expected: FAIL por funciones no definidas.

**Step 3: Write minimal implementation**

- Añadir funciones de lectura de tareas visibles para el usuario autenticado.
- Crear server action para alta de tareas solo admin.
- Crear server action para cambio de estado permitiendo `pending`, `in_progress`, `done`.
- Validar en servidor permisos y datos obligatorios.

**Step 4: Run test to verify it passes**

Run: `cmd /c npm test -- src/lib/tasks.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/data.ts src/lib/actions/tasks.ts src/lib/tasks.test.ts src/lib/auth.ts
git commit -m "feat: add task data access and actions"
```

### Task 3: Navegacion y pagina protegida de tareas

**Files:**
- Modify: `src/components/layout/sidebar.tsx`
- Create: `src/app/(protected)/tasks/page.tsx`
- Create: `src/components/tasks/tasks-page.tsx`
- Create: `src/components/tasks/task-summary.tsx`

**Step 1: Write the failing test**

Definir expectativa de navegacion y render base para la nueva ruta protegida, al menos a nivel de tipos/props y estados vacios.

**Step 2: Run test to verify it fails**

Run: `cmd /c npx tsc --noEmit`
Expected: FAIL por pagina o componentes no creados.

**Step 3: Write minimal implementation**

- Añadir `Tareas` al sidebar para ambos roles.
- Crear pagina server-side que cargue perfil, rol y tareas visibles.
- Montar cabecera con resumen por estado.
- Añadir estado vacio legible cuando no haya tareas.

**Step 4: Run test to verify it passes**

Run: `cmd /c npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/layout/sidebar.tsx src/app/(protected)/tasks/page.tsx src/components/tasks/tasks-page.tsx src/components/tasks/task-summary.tsx
git commit -m "feat: add protected tasks page shell"
```

### Task 4: Formulario admin, tablero y lista

**Files:**
- Create: `src/components/tasks/task-create-form.tsx`
- Create: `src/components/tasks/task-board.tsx`
- Create: `src/components/tasks/task-list.tsx`
- Create: `src/components/tasks/task-status-select.tsx`
- Modify: `src/components/tasks/tasks-page.tsx`
- Modify: `src/components/ui/card.tsx` (solo si falta alguna variante minima)

**Step 1: Write the failing test**

Escribir tests de utilidades puras para filtrado por texto/estado y agrupacion por columnas.

**Step 2: Run test to verify it fails**

Run: `cmd /c npm test -- src/lib/tasks.test.ts`
Expected: FAIL para helpers visuales no implementados.

**Step 3: Write minimal implementation**

- Formulario visible solo para admin con `title`, `description`, `priority`.
- Tablero con tres columnas y tarjetas visuales.
- Lista inferior con buscador y filtro por estado.
- Selector de estado para admin y empleado con actualizacion sin recarga completa.
- Adaptar layout para escritorio y movil.

**Step 4: Run test to verify it passes**

Run: `cmd /c npm test -- src/lib/tasks.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tasks src/lib/tasks.test.ts
git commit -m "feat: add task board and filtered list UI"
```

### Task 5: Verificacion final

**Files:**
- Modify: `README.md` (solo si se documenta el modulo)

**Step 1: Run focused tests**

Run: `cmd /c npm test -- src/lib/tasks.test.ts`
Expected: PASS

**Step 2: Run full test suite**

Run: `cmd /c npm test`
Expected: PASS

**Step 3: Run lint**

Run: `cmd /c npm run lint`
Expected: PASS

**Step 4: Run build**

Run: `cmd /c npm run build`
Expected: PASS

**Step 5: Review final diff**

Confirmar:
- solo admin crea tareas
- empleado solo cambia estado
- tablero y lista conviven en la misma pantalla
- estados vacios y errores son comprensibles

**Step 6: Commit**

```bash
git add README.md src supabase
git commit -m "feat: add internal task management module"
```
