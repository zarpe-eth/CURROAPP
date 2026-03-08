import { describe, expect, it } from "vitest";
import { buildMonthlyMetrics } from "@/lib/data";
import type { WorkSession } from "@/types/domain";

describe("buildMonthlyMetrics", () => {
  it("uses stored money_earned when available", () => {
    const sessions: WorkSession[] = [
      {
        id: "1",
        user_id: "u1",
        started_at: "2026-03-01T08:00:00.000Z",
        ended_at: "2026-03-01T12:00:00.000Z",
        status: "completed",
        duration_seconds: 14400,
        money_earned: 32,
        work_breaks: [],
      },
      {
        id: "2",
        user_id: "u1",
        started_at: "2026-03-02T08:00:00.000Z",
        ended_at: "2026-03-02T10:00:00.000Z",
        status: "completed",
        duration_seconds: 7200,
        money_earned: 16,
        work_breaks: [],
      },
    ];

    const result = buildMonthlyMetrics(sessions, 1, "Europe/Madrid");

    expect(result.monthlyMoney).toBe(48);
  });
});
