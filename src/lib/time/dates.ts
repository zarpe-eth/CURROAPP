import { addMonths, endOfDay, format, startOfDay } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export function getTodayRangeInTimezone(timezone: string) {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const start = startOfDay(zonedNow);
  const end = endOfDay(zonedNow);

  return {
    startUtcIso: fromZonedTime(start, timezone).toISOString(),
    endUtcIso: fromZonedTime(end, timezone).toISOString(),
  };
}

export function getMonthRangeInTimezone(month: string, timezone: string) {
  const [year, mon] = month.split("-").map(Number);
  const zonedStart = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0));
  const zonedEnd = addMonths(zonedStart, 1);

  return {
    startUtcIso: fromZonedTime(zonedStart, timezone).toISOString(),
    endUtcIso: fromZonedTime(zonedEnd, timezone).toISOString(),
  };
}

export function formatDateTime(dateIso: string, timezone: string) {
  return formatInTimeZone(dateIso, timezone, "dd/MM/yyyy HH:mm");
}

export function formatTime(dateIso: string, timezone: string) {
  return formatInTimeZone(dateIso, timezone, "HH:mm");
}

export function formatDate(dateIso: string, timezone: string) {
  return formatInTimeZone(dateIso, timezone, "dd/MM/yyyy");
}

export function getCurrentMonth() {
  return format(new Date(), "yyyy-MM");
}

