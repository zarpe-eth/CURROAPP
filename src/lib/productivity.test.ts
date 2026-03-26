import { describe, expect, it } from "vitest";
import { buildMonthlyProductivityMetrics } from "@/lib/productivity";
import type { DailyTicketStat, WorkSession } from "@/types/domain";

describe("buildMonthlyProductivityMetrics", () => {
  it("computes day and month ticket rates", () => {
    const sessions: WorkSession[] = [
      {
        id: "s1",
        user_id: "u1",
        started_at: "2026-03-10T08:00:00.000Z",
        ended_at: "2026-03-10T12:00:00.000Z",
        status: "completed",
        duration_seconds: 14400,
        money_earned: 0,
        work_breaks: [],
      },
      {
        id: "s2",
        user_id: "u1",
        started_at: "2026-03-11T08:00:00.000Z",
        ended_at: "2026-03-11T10:00:00.000Z",
        status: "completed",
        duration_seconds: 7200,
        money_earned: 0,
        work_breaks: [],
      },
    ];

    const tickets: DailyTicketStat[] = [
      {
        id: "t1",
        user_id: "u1",
        stat_date: "2026-03-10",
        tickets_resolved: 8,
        created_by: "admin",
        created_at: "2026-03-10T12:00:00.000Z",
        updated_at: "2026-03-10T12:00:00.000Z",
      },
      {
        id: "t2",
        user_id: "u1",
        stat_date: "2026-03-11",
        tickets_resolved: 4,
        created_by: "admin",
        created_at: "2026-03-11T12:00:00.000Z",
        updated_at: "2026-03-11T12:00:00.000Z",
      },
    ];

    const result = buildMonthlyProductivityMetrics({
      sessions,
      tickets,
      timezone: "Europe/Madrid",
      selectedDate: "2026-03-10",
    });

    expect(result.dailyTickets).toBe(8);
    expect(result.monthlyTickets).toBe(12);
    expect(result.dailyTicketsPerHour).toBe(2);
    expect(result.monthlyTicketsPerHour).toBe(2);
    expect(result.averageDailyTickets).toBe(6);
  });

  it("returns null rates when there are no worked hours", () => {
    const result = buildMonthlyProductivityMetrics({
      sessions: [],
      tickets: [
        {
          id: "t1",
          user_id: "u1",
          stat_date: "2026-03-12",
          tickets_resolved: 5,
          created_by: "admin",
          created_at: "2026-03-12T12:00:00.000Z",
          updated_at: "2026-03-12T12:00:00.000Z",
        },
      ],
      timezone: "Europe/Madrid",
      selectedDate: "2026-03-12",
    });

    expect(result.dailyTickets).toBe(5);
    expect(result.dailyTicketsPerHour).toBeNull();
    expect(result.monthlyTicketsPerHour).toBeNull();
  });

  it("includes points even for days with only tickets or only hours", () => {
    const sessions: WorkSession[] = [
      {
        id: "s1",
        user_id: "u1",
        started_at: "2026-03-13T08:00:00.000Z",
        ended_at: "2026-03-13T09:00:00.000Z",
        status: "completed",
        duration_seconds: 3600,
        money_earned: 0,
        work_breaks: [],
      },
    ];

    const tickets: DailyTicketStat[] = [
      {
        id: "t1",
        user_id: "u1",
        stat_date: "2026-03-14",
        tickets_resolved: 3,
        created_by: "admin",
        created_at: "2026-03-14T12:00:00.000Z",
        updated_at: "2026-03-14T12:00:00.000Z",
      },
    ];

    const result = buildMonthlyProductivityMetrics({
      sessions,
      tickets,
      timezone: "Europe/Madrid",
      selectedDate: "2026-03-13",
    });

    expect(result.dailyPoints).toHaveLength(2);
    expect(result.dailyPoints[0]?.date).toBe("2026-03-13");
    expect(result.dailyPoints[1]?.date).toBe("2026-03-14");
  });
});
