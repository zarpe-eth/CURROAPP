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
  work_breaks?: WorkBreak[];
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

