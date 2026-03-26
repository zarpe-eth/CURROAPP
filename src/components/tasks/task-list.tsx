import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskStatusSelect } from "@/components/tasks/task-status-select";
import type { Profile, Task } from "@/types/domain";

function getStatusLabel(status: Task["status"]) {
  if (status === "in_progress") return "En curso";
  if (status === "done") return "Hecha";
  return "Pendiente";
}

function getPriorityLabel(priority: Task["priority"]) {
  if (priority === "high") return "Alta";
  if (priority === "low") return "Baja";
  return "Media";
}

type TaskListProps = {
  tasks: Task[];
  profiles: Profile[];
};

export function TaskList({ tasks, profiles }: TaskListProps) {
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile.full_name]));

  return (
    <Card className="animate-enter overflow-hidden" style={{ animationDelay: "180ms" }}>
      <CardHeader className="border-b border-border/70 bg-white/90">
        <CardTitle className="text-xl">Lista operativa</CardTitle>
        <p className="text-sm text-muted-foreground">
          Vista rapida para encontrar incidencias y cambiar su estado sin perder contexto.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarea</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Actualizar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length ? (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">{task.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {task.description ?? "Sin descripcion adicional."}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{profileMap.get(task.assigned_to) ?? "Javi"}</TableCell>
                  <TableCell>
                    <Badge>{getPriorityLabel(task.priority)}</Badge>
                  </TableCell>
                  <TableCell>{getStatusLabel(task.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <TaskStatusSelect taskId={task.id} status={task.status} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No hay tareas que coincidan con el filtro actual.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
