"use client";

import { createTaskAction } from "@/lib/actions/tasks";
import type { Profile } from "@/types/domain";
import { Button } from "@/components/ui/button";

type TaskCreateFormProps = {
  profiles: Profile[];
};

export function TaskCreateForm({ profiles }: TaskCreateFormProps) {
  return (
    <form action={createTaskAction} className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Titulo
        </label>
        <input
          name="title"
          required
          placeholder="Ej. Revisar incidencia de proveedor"
          className="h-11 w-full rounded-xl border border-border/90 bg-white px-3 text-sm text-foreground outline-none ring-primary/20 transition focus:border-primary/40 focus:ring-4"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Descripcion
        </label>
        <textarea
          name="description"
          rows={4}
          placeholder="Detalles que Javi necesita para resolverla"
          className="w-full rounded-2xl border border-border/90 bg-white px-3 py-3 text-sm text-foreground outline-none ring-primary/20 transition focus:border-primary/40 focus:ring-4"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Asignar a
        </label>
        <select
          name="assigned_to"
          required
          defaultValue={profiles[0]?.id ?? ""}
          className="h-11 w-full rounded-xl border border-border/90 bg-white px-3 text-sm text-foreground outline-none ring-primary/20 transition focus:border-primary/40 focus:ring-4"
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Prioridad
        </label>
        <select
          name="priority"
          defaultValue="medium"
          className="h-11 w-full rounded-xl border border-border/90 bg-white px-3 text-sm text-foreground outline-none ring-primary/20 transition focus:border-primary/40 focus:ring-4"
        >
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit">Crear tarea</Button>
      </div>
    </form>
  );
}
