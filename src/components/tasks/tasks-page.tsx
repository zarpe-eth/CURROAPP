"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskCreateForm } from "@/components/tasks/task-create-form";
import { TaskList } from "@/components/tasks/task-list";
import { TaskSummary } from "@/components/tasks/task-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Profile, Task, TaskStatus } from "@/types/domain";

type TasksPageProps = {
  isAdmin: boolean;
  currentUserId: string;
  currentUserName: string;
  tasks: Task[];
  profiles: Profile[];
};

function buildSummary(tasks: Task[]) {
  return tasks.reduce(
    (acc, task) => {
      acc[task.status] += 1;
      acc.total += 1;
      return acc;
    },
    {
      pending: 0,
      in_progress: 0,
      done: 0,
      total: 0,
    },
  );
}

function matchesStatusFilter(task: Task, status: "all" | TaskStatus) {
  return status === "all" ? true : task.status === status;
}

export function TasksPage({ isAdmin, currentUserId, currentUserName, tasks, profiles }: TasksPageProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const deferredQuery = useDeferredValue(query);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesQuery =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description?.toLowerCase().includes(normalizedQuery);

      return matchesQuery && matchesStatusFilter(task, statusFilter);
    });
  }, [deferredQuery, statusFilter, tasks]);

  const summary = useMemo(() => buildSummary(tasks), [tasks]);
  const effectiveProfiles: Profile[] = profiles.length
    ? profiles
    : [
        {
          id: currentUserId,
          full_name: currentUserName,
          email: null,
          role: "employee",
          hourly_rate_eur: 0,
        },
      ];

  return (
    <section className="space-y-6">
      <Card className="animate-enter overflow-hidden">
        <CardHeader className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.85))]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Gestion interna</p>
              <CardTitle className="mt-1 text-3xl">Tareas de soporte</CardTitle>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Sustituye el paso por WhatsApp por un tablero claro, visual y facil de entender para Javi.
              </p>
            </div>
            <Badge className="text-sm">{isAdmin ? "admin" : "empleado"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {isAdmin ? (
            <div className="rounded-2xl border border-border/80 bg-white/90 p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">Nueva tarea</p>
              <TaskCreateForm profiles={effectiveProfiles} />
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 text-sm text-muted-foreground">
              Aqui puedes ver el trabajo que te han pasado y mover cada tarea entre pendiente, en curso y hecha.
            </div>
          )}

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por titulo o descripcion"
                className="pl-10"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | TaskStatus)}
              className="h-11 rounded-xl border border-border/90 bg-white px-3 text-sm text-foreground outline-none ring-primary/20 transition focus:border-primary/40 focus:ring-4"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="in_progress">En curso</option>
              <option value="done">Hechas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TaskSummary label="Pendientes" value={summary.pending} accentClassName="bg-amber-400" delay="40ms" />
        <TaskSummary label="En curso" value={summary.in_progress} accentClassName="bg-sky-500" delay="80ms" />
        <TaskSummary label="Hechas" value={summary.done} accentClassName="bg-emerald-500" delay="120ms" />
        <TaskSummary label="Total" value={summary.total} accentClassName="bg-slate-400" delay="160ms" />
      </div>

      <TaskBoard tasks={filteredTasks} profiles={effectiveProfiles} />
      <TaskList tasks={filteredTasks} profiles={effectiveProfiles} />
    </section>
  );
}
