import { formatInTimeZone } from "date-fns-tz";
import { calculateEffectiveDurationSeconds } from "@/lib/time/calc";
import type { DailyTicketStat, MonthlyProductivityMetrics, WorkSession } from "@/types/domain";

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function buildDailyHoursMap(sessions: WorkSession[], timezone: string) {
  const byDay = new Map<string, number>();

  for (const session of sessions) {
    const dayKey = formatInTimeZone(session.started_at, timezone, "yyyy-MM-dd");
    const seconds =
      session.duration_seconds ??
      calculateEffectiveDurationSeconds(
        session.started_at,
        session.ended_at,
        session.work_breaks ?? [],
        new Date().toISOString(),
      );

    byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + seconds / 3600);
  }

  return byDay;
}

function buildDailyTicketsMap(tickets: DailyTicketStat[]) {
  const byDay = new Map<string, number>();

  for (const ticket of tickets) {
    byDay.set(ticket.stat_date, (byDay.get(ticket.stat_date) ?? 0) + ticket.tickets_resolved);
  }

  return byDay;
}

export function buildMonthlyProductivityMetrics({
  sessions,
  tickets,
  timezone,
  selectedDate,
}: {
  sessions: WorkSession[];
  tickets: DailyTicketStat[];
  timezone: string;
  selectedDate: string;
}): MonthlyProductivityMetrics {
  const dailyHoursMap = buildDailyHoursMap(sessions, timezone);
  const dailyTicketsMap = buildDailyTicketsMap(tickets);

  const monthlyHours = [...dailyHoursMap.values()].reduce((acc, hours) => acc + hours, 0);
  const monthlyTickets = [...dailyTicketsMap.values()].reduce((acc, value) => acc + value, 0);

  const dailyTickets = dailyTicketsMap.get(selectedDate) ?? 0;
  const dailyHours = dailyHoursMap.get(selectedDate) ?? 0;

  const dailyKeys = new Set<string>([...dailyHoursMap.keys(), ...dailyTicketsMap.keys()]);
  const dailyPoints = [...dailyKeys]
    .sort((a, b) => a.localeCompare(b))
    .map((date) => {
      const hoursWorked = round2(dailyHoursMap.get(date) ?? 0);
      const ticketsResolved = dailyTicketsMap.get(date) ?? 0;

      return {
        date,
        hoursWorked,
        ticketsResolved,
        ticketsPerHour: hoursWorked > 0 ? round2(ticketsResolved / hoursWorked) : null,
      };
    });

  const averageDailyTickets = dailyTicketsMap.size ? round2(monthlyTickets / dailyTicketsMap.size) : 0;

  return {
    dailyTickets,
    monthlyTickets,
    dailyTicketsPerHour: dailyHours > 0 ? round2(dailyTickets / dailyHours) : null,
    monthlyTicketsPerHour: monthlyHours > 0 ? round2(monthlyTickets / monthlyHours) : null,
    averageDailyTickets,
    dailyPoints,
  };
}
