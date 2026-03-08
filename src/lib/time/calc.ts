type BreakRange = {
  break_start: string;
  break_end: string | null;
};

const toDate = (value: string) => new Date(value);

const clampSeconds = (value: number) => Math.max(0, Math.floor(value));

export function calculateEffectiveDurationSeconds(
  startedAt: string,
  endedAt: string | null,
  breaks: BreakRange[],
  nowIso?: string,
): number {
  const start = toDate(startedAt).getTime();
  const end = toDate(endedAt ?? nowIso ?? new Date().toISOString()).getTime();
  const grossSeconds = clampSeconds((end - start) / 1000);

  const breakSeconds = breaks.reduce((acc, item) => {
    const breakStart = toDate(item.break_start).getTime();
    const breakEnd = toDate(item.break_end ?? nowIso ?? new Date().toISOString()).getTime();
    const delta = clampSeconds((breakEnd - breakStart) / 1000);

    return acc + delta;
  }, 0);

  return clampSeconds(grossSeconds - breakSeconds);
}

export function calculateMoneyFromSeconds(seconds: number, hourlyRate: number): number {
  const amount = (seconds / 3600) * hourlyRate;
  return Math.round(amount * 100) / 100;
}

export function formatDuration(totalSeconds: number): string {
  const safe = clampSeconds(totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

