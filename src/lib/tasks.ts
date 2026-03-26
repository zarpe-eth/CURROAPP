import type { Task, TaskPriority, TaskStatus } from "@/types/domain";

const TASK_STATUSES = ["pending", "in_progress", "done"] as const;
const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export function parseTaskStatus(value: string | FormDataEntryValue | null): TaskStatus {
  const status = String(value ?? "");

  if (TASK_STATUSES.includes(status as TaskStatus)) {
    return status as TaskStatus;
  }

  throw new Error("Estado de tarea no valido");
}

export function parseTaskPriority(value: string | FormDataEntryValue | null): TaskPriority {
  const priority = String(value ?? "");

  if (TASK_PRIORITIES.includes(priority as TaskPriority)) {
    return priority as TaskPriority;
  }

  throw new Error("Prioridad de tarea no valida");
}

export function countTasksByStatus(tasks: Pick<Task, "status">[]) {
  return tasks.reduce(
    (acc, task) => {
      acc[task.status] += 1;
      return acc;
    },
    {
      pending: 0,
      in_progress: 0,
      done: 0,
    } satisfies Record<TaskStatus, number>,
  );
}

export function buildTaskStatusCounts(tasks: Pick<Task, "status">[]) {
  return {
    ...countTasksByStatus(tasks),
    total: tasks.length,
  };
}

export function normalizeTaskInput(title: string, description?: string | null) {
  const cleanTitle = title.trim();
  const cleanDescription = description?.trim() ? description.trim() : null;

  if (!cleanTitle) {
    throw new Error("El titulo es obligatorio");
  }

  return {
    title: cleanTitle,
    description: cleanDescription,
  };
}
