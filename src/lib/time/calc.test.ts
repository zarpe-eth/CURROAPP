import { describe, expect, it } from "vitest";
import {
  calculateEffectiveDurationSeconds,
  calculateMoneyFromSeconds,
  formatDuration,
} from "@/lib/time/calc";

describe("time calculations", () => {
  it("subtracts break durations from session span", () => {
    const start = "2026-03-08T09:00:00.000Z";
    const end = "2026-03-08T13:00:00.000Z";

    const duration = calculateEffectiveDurationSeconds(start, end, [
      { break_start: "2026-03-08T10:00:00.000Z", break_end: "2026-03-08T10:15:00.000Z" },
      { break_start: "2026-03-08T11:30:00.000Z", break_end: "2026-03-08T11:45:00.000Z" },
    ]);

    expect(duration).toBe(12600);
  });

  it("handles open sessions using now argument", () => {
    const start = "2026-03-08T09:00:00.000Z";
    const now = "2026-03-08T10:00:00.000Z";

    const duration = calculateEffectiveDurationSeconds(start, null, [], now);

    expect(duration).toBe(3600);
  });

  it("calculates money from seconds and hourly rate", () => {
    expect(calculateMoneyFromSeconds(5400, 8)).toBe(12);
  });

  it("formats seconds into HH:mm:ss", () => {
    expect(formatDuration(3661)).toBe("01:01:01");
  });
});

