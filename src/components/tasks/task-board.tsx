import { Clock3, CircleDashed, CircleCheckBig } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusSelect } from "@/components/tasks/task-status-select";
import { cn } from "@/lib/utils";
import type { Profile, Task, TaskStatus } from "@/types/domain";

const columns: Array<{
  status: TaskStatus;
  label: string;
  icon: typeof CircleDashed;
  accentClassName: string;
}> = [
  { status: "pending", label: "Pendiente", icon: CircleDashed, accentClassName: "text-amber-600" },
  { status: "in_progress", label: "En curso", icon: Clock3, accentClassName: "text-sky-600" },
  { status: "done", label: "Hecha", icon: CircleCheckBig, accentClassName: "text-emerald-600" },
];

function getPriorityLabel(priority: Task["priority"]) {
  if (priority === "high") return "Alta";
  if (priority === "low") return "Baja";
  return "Media";
}

function getPriorityClassName(priority: Task["priority"]) {
  if (priority === "high") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "low") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

type TaskBoardProps = {
  tasks: Task[];
  profiles: Profile[];
};

export function TaskBoard({ tasks, profiles }: TaskBoardProps) {
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile.full_name]));

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {columns.map((column, index) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);
        const Icon = column.icon;

        return (
          <Card
            key={column.status}
            className="animate-enter border-border/80 bg-white/90"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("rounded-2xl bg-muted/70 p-2", column.accentClassName)}>
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="text-xl">{column.label}</CardTitle>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{columnTasks.length} tareas</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {columnTasks.length ? (
                columnTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{task.title}</p>
                        {task.description ? (
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{task.description}</p>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">Sin descripcion adicional.</p>
                        )}
                      </div>
                      <Badge className={cn("border", getPriorityClassName(task.priority))}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Asignada a {profileMap.get(task.assigned_to) ?? "Javi"}
                      </p>
                      <TaskStatusSelect taskId={task.id} status={task.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/35 p-6 text-sm text-muted-foreground">
                  No hay tareas en esta columna.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
