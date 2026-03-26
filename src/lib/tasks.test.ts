import { describe, expect, it } from "vitest";
import { countTasksByStatus, parseTaskPriority, parseTaskStatus } from "@/lib/actions/tasks";
import type { Task } from "@/types/domain";

describe("countTasksByStatus", () => {
  it("groups tasks by status and fills missing buckets with zero", () => {
    const tasks: Task[] = [
      {
        id: "1",
        title: "Revisar incidencia",
        description: null,
        status: "pending",
        priority: "medium",
        assigned_to: "u1",
        created_by: "admin",
        created_at: "2026-03-26T10:00:00.000Z",
        updated_at: "2026-03-26T10:00:00.000Z",
      },
      {
        id: "2",
        title: "Llamar al proveedor",
        description: null,
        status: "in_progress",
        priority: "high",
        assigned_to: "u1",
        created_by: "admin",
        created_at: "2026-03-26T11:00:00.000Z",
        updated_at: "2026-03-26T11:00:00.000Z",
      },
      {
        id: "3",
        title: "Cerrar incidencia",
        description: null,
        status: "done",
        priority: "low",
        assigned_to: "u1",
        created_by: "admin",
        created_at: "2026-03-26T12:00:00.000Z",
        updated_at: "2026-03-26T12:00:00.000Z",
      },
      {
        id: "4",
        title: "Otra tarea",
        description: null,
        status: "pending",
        priority: "low",
        assigned_to: "u1",
        created_by: "admin",
        created_at: "2026-03-26T13:00:00.000Z",
        updated_at: "2026-03-26T13:00:00.000Z",
      },
    ];

    expect(countTasksByStatus(tasks)).toEqual({
      pending: 2,
      in_progress: 1,
      done: 1,
    });
  });
});

describe("parseTaskStatus", () => {
  it("accepts only supported task statuses", () => {
    expect(parseTaskStatus("pending")).toBe("pending");
    expect(parseTaskStatus("in_progress")).toBe("in_progress");
    expect(parseTaskStatus("done")).toBe("done");
    expect(() => parseTaskStatus("blocked")).toThrow("Estado de tarea no valido");
  });
});

describe("parseTaskPriority", () => {
  it("accepts only supported task priorities", () => {
    expect(parseTaskPriority("low")).toBe("low");
    expect(parseTaskPriority("medium")).toBe("medium");
    expect(parseTaskPriority("high")).toBe("high");
    expect(() => parseTaskPriority("urgent")).toThrow("Prioridad de tarea no valida");
  });
});
