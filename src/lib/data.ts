import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_EMPLOYEE_NAME, DEFAULT_HOURLY_RATE, DEFAULT_TIMEZONE } from "@/lib/constants";
import { calculateEffectiveDurationSeconds, calculateMoneyFromSeconds } from "@/lib/time/calc";
import { getMonthRangeInTimezone, getTodayRangeInTimezone } from "@/lib/time/dates";
import type { AppSettings, DailyHoursPoint, DailyTicketStat, Task, WorkSession } from "@/types/domain";

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();

  if (!data) {
    return {
      id: "local-default",
      hourly_rate_eur: DEFAULT_HOURLY_RATE,
      timezone: DEFAULT_TIMEZONE,
      employee_display_name: DEFAULT_EMPLOYEE_NAME,
      updated_at: new Date().toISOString(),
    };
  }

  return data as AppSettings;
}

export async function getActiveSession(userId: string): Promise<WorkSession | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("work_sessions")
    .select("*, work_breaks(*)")
    .eq("user_id", userId)
    .is("ended_at", null)
    .in("status", ["active", "paused"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as WorkSession | null;
}

export async function getTodaySummary(userId: string, hourlyRate: number, timezone: string) {
  const supabase = await createClient();
  const { startUtcIso, endUtcIso } = getTodayRangeInTimezone(timezone);

  const { data } = await supabase
    .from("work_sessions")
    .select("*, work_breaks(*)")
    .eq("user_id", userId)
    .gte("started_at", startUtcIso)
    .lt("started_at", endUtcIso);

  const sessions = (data ?? []) as WorkSession[];

  const seconds = sessions.reduce((acc, session) => {
    if (session.duration_seconds && session.status === "completed") {
      return acc + session.duration_seconds;
    }

    return (
      acc +
      calculateEffectiveDurationSeconds(
        session.started_at,
        session.ended_at,
        session.work_breaks ?? [],
        new Date().toISOString(),
      )
    );
  }, 0);

  const money = sessions.reduce((acc, session) => {
    if (typeof session.money_earned === "number") {
      return acc + session.money_earned;
    }

    const sessionSeconds =
      session.duration_seconds ??
      calculateEffectiveDurationSeconds(
        session.started_at,
        session.ended_at,
        session.work_breaks ?? [],
        new Date().toISOString(),
      );

    return acc + calculateMoneyFromSeconds(sessionSeconds, hourlyRate);
  }, 0);

  return {
    seconds,
    money: Math.round(money * 100) / 100,
  };
}

export async function getSessionsByMonth(
  month: string,
  timezone: string,
  userId?: string,
): Promise<WorkSession[]> {
  const supabase = await createClient();
  const { startUtcIso, endUtcIso } = getMonthRangeInTimezone(month, timezone);

  let query = supabase
    .from("work_sessions")
    .select("*, work_breaks(*)")
    .gte("started_at", startUtcIso)
    .lt("started_at", endUtcIso)
    .order("started_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data } = await query;
  return (data ?? []) as WorkSession[];
}

export async function getDailyTicketStatsByMonth(month: string, userId?: string): Promise<DailyTicketStat[]> {
  const supabase = await createClient();
  const [year, mon] = month.split("-").map(Number);
  const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
  const endYear = mon === 12 ? year + 1 : year;
  const endMonth = mon === 12 ? 1 : mon + 1;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  let query = supabase
    .from("daily_ticket_stats")
    .select("*")
    .gte("stat_date", startDate)
    .lt("stat_date", endDate)
    .order("stat_date", { ascending: true });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error?.message?.includes("Could not find the table 'public.daily_ticket_stats'")) {
    let legacyQuery = supabase
      .from("ticket_stats")
      .select("id,user_id,stat_date,tickets_responded,created_at")
      .gte("stat_date", startDate)
      .lt("stat_date", endDate)
      .order("stat_date", { ascending: true });

    if (userId) {
      legacyQuery = legacyQuery.eq("user_id", userId);
    }

    const { data: legacy } = await legacyQuery;
    return (legacy ?? []).map((item) => {
      const row = item as {
        id: string;
        user_id: string;
        stat_date: string;
        tickets_responded: number;
        created_at: string;
      };

      return {
        id: row.id,
        user_id: row.user_id,
        stat_date: row.stat_date,
        tickets_resolved: row.tickets_responded ?? 0,
        created_by: row.user_id,
        created_at: row.created_at,
        updated_at: row.created_at,
      } satisfies DailyTicketStat;
    });
  }

  return (data ?? []) as DailyTicketStat[];
}

export async function getVisibleTasks(assignedToUserId?: string): Promise<Task[]> {
  const supabase = await createClient();

  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });

  if (assignedToUserId) {
    query = query.eq("assigned_to", assignedToUserId);
  }

  const { data, error } = await query;

  if (error?.message?.includes("Could not find the table 'public.tasks'")) {
    return [];
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Task[];
}

export function buildMonthlyMetrics(sessions: WorkSession[], hourlyRate: number, timezone: string) {
  const byDay = new Map<string, number>();

  let totalSeconds = 0;
  for (const session of sessions) {
    const seconds =
      session.duration_seconds ??
      calculateEffectiveDurationSeconds(
        session.started_at,
        session.ended_at,
        session.work_breaks ?? [],
        new Date().toISOString(),
      );

    totalSeconds += seconds;
    const day = format(new Date(session.started_at), "dd");
    byDay.set(day, (byDay.get(day) ?? 0) + seconds / 3600);
  }

  const points: DailyHoursPoint[] = [...byDay.entries()]
    .map(([day, hours]) => ({ day, hours: Math.round(hours * 100) / 100 }))
    .sort((a, b) => Number(a.day) - Number(b.day));

  const workedDays = byDay.size;
  const avgHours = workedDays ? totalSeconds / 3600 / workedDays : 0;
  const monthlyMoney = sessions.reduce((acc, session) => {
    if (typeof session.money_earned === "number") {
      return acc + session.money_earned;
    }

    const sessionSeconds =
      session.duration_seconds ??
      calculateEffectiveDurationSeconds(
        session.started_at,
        session.ended_at,
        session.work_breaks ?? [],
        new Date().toISOString(),
      );

    return acc + calculateMoneyFromSeconds(sessionSeconds, hourlyRate);
  }, 0);

  return {
    totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
    workedDays,
    averageHoursPerDay: Math.round(avgHours * 100) / 100,
    monthlyMoney: Math.round(monthlyMoney * 100) / 100,
    dailyHours: points,
    timezone,
  };
}

