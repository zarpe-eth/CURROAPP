export type AppRole = "admin" | "employee";

export type SessionStatus = "active" | "paused" | "completed";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  hourly_rate_eur: number;
  role: AppRole;
};

export type WorkBreak = {
  id: string;
  session_id: string;
  break_start: string;
  break_end: string | null;
  duration_seconds: number | null;
};

export type WorkSession = {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  status: SessionStatus;
  duration_seconds: number | null;
  money_earned: number | null;
  one_hour_notified?: boolean;
  work_breaks?: WorkBreak[];
};

export type DailyTicketStat = {
  id: string;
  user_id: string;
  stat_date: string;
  tickets_resolved: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type DailyProductivityPoint = {
  date: string;
  hoursWorked: number;
  ticketsResolved: number;
  ticketsPerHour: number | null;
};

export type MonthlyProductivityMetrics = {
  dailyTickets: number;
  monthlyTickets: number;
  dailyTicketsPerHour: number | null;
  monthlyTicketsPerHour: number | null;
  averageDailyTickets: number;
  dailyPoints: DailyProductivityPoint[];
};

export type AppSettings = {
  id: string;
  hourly_rate_eur: number;
  timezone: string;
  employee_display_name: string;
  updated_at: string;
};

export type DailyHoursPoint = {
  day: string;
  hours: number;
};

