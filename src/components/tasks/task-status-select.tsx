"use client";

import { updateTaskStatusAction } from "@/lib/actions/tasks";
import type { TaskStatus } from "@/types/domain";

type TaskStatusSelectProps = {
  taskId: string;
  status: TaskStatus;
};

export function TaskStatusSelect({ taskId, status }: TaskStatusSelectProps) {
  return (
    <form action={updateTaskStatusAction}>
      <input type="hidden" name="task_id" value={taskId} />
      <select
        name="status"
        defaultValue={status}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-9 rounded-xl border border-border/90 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-foreground outline-none ring-primary/20 transition focus:border-primary/40 focus:ring-4"
      >
        <option value="pending">Pendiente</option>
        <option value="in_progress">En curso</option>
        <option value="done">Hecha</option>
      </select>
    </form>
  );
}
