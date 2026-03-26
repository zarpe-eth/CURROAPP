import { calculateEffectiveDurationSeconds } from "@/lib/time/calc";

type SessionBreak = {
  break_start: string;
  break_end: string | null;
  duration_seconds?: number | null;
};

type CalculateLiveElapsedSecondsArgs = {
  startedAt: string;
  endedAt: string | null;
  breaks: SessionBreak[];
  nowIso?: string;
};

function toValidIso(value: string) {
  return Number.isNaN(Date.parse(value)) ? null : value;
}

export function calculateLiveElapsedSeconds({
  startedAt,
  endedAt,
  breaks,
  nowIso,
}: CalculateLiveElapsedSecondsArgs) {
  const safeStart = toValidIso(startedAt);
  if (!safeStart) {
    return 0;
  }

  const safeEnd = endedAt ? toValidIso(endedAt) : null;
  const safeNow = nowIso ? toValidIso(nowIso) : new Date().toISOString();

  if (!safeNow) {
    return 0;
  }

  return calculateEffectiveDurationSeconds(safeStart, safeEnd, breaks, safeNow);
}

export function shouldTriggerOneHourNotification({
  elapsedSeconds,
  oneHourNotified,
}: {
  elapsedSeconds: number;
  oneHourNotified: boolean;
}) {
  return elapsedSeconds >= 3600 && !oneHourNotified;
}
