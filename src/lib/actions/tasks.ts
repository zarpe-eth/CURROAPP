"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin, isUserAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { normalizeTaskInput, parseTaskPriority, parseTaskStatus } from "@/lib/tasks";

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
  const { title, description } = normalizeTaskInput(String(formData.get("title") ?? ""), String(formData.get("description") ?? ""));

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
