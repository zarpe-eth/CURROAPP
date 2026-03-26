"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin, isUserAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Task, TaskPriority, TaskStatus } from "@/types/domain";

const TASK_STATUSES = ["pending", "in_progress", "done"] as const;
const TASK_PRIORITIES = ["low", "medium", "high"] as const;

type TaskStatusCounts = Record<TaskStatus, number>;

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

export function countTasksByStatus(tasks: Pick<Task, "status">[]): TaskStatusCounts {
  return tasks.reduce<TaskStatusCounts>(
    (acc, task) => {
      acc[task.status] += 1;
      return acc;
    },
    {
      pending: 0,
      in_progress: 0,
      done: 0,
    },
  );
}

function normalizeTaskInput(title: string, description?: string | null) {
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

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  return { supabase, user };
}

export async function createTaskAction(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();

  await assertAdmin(user.id, user.email);

  const assignedTo = String(formData.get("assigned_to") ?? "").trim();
  const priority = parseTaskPriority(formData.get("priority"));
  const { title, description } = normalizeTaskInput(
    String(formData.get("title") ?? ""),
    String(formData.get("description") ?? ""),
  );

  if (!assignedTo) {
    throw new Error("Empleado invalido");
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    description,
    status: "pending",
    priority,
    assigned_to: assignedTo,
    created_by: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function updateTaskStatusAction(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();

  const taskId = String(formData.get("task_id") ?? "").trim();
  const status = parseTaskStatus(formData.get("status"));

  if (!taskId) {
    throw new Error("La tarea es obligatoria");
  }

  const admin = await isUserAdmin(user.id, user.email);

  let query = supabase.from("tasks").update({ status }).eq("id", taskId);

  if (!admin) {
    query = query.eq("assigned_to", user.id);
  }

  const { data, error } = await query.select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("No se pudo actualizar la tarea");
  }

  revalidatePath("/tasks");
}
