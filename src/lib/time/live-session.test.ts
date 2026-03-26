import { describe, expect, it } from "vitest";
import {
  calculateLiveElapsedSeconds,
  shouldTriggerOneHourNotification,
} from "@/lib/time/live-session";

describe("live session time", () => {
  it("calculates elapsed from start and closed breaks", () => {
    const elapsed = calculateLiveElapsedSeconds({
      startedAt: "2026-03-09T08:00:00.000Z",
      endedAt: null,
      nowIso: "2026-03-09T10:00:00.000Z",
      breaks: [
        {
          break_start: "2026-03-09T08:30:00.000Z",
          break_end: "2026-03-09T08:45:00.000Z",
        },
      ],
    });

    expect(elapsed).toBe(6300);
  });

  it("handles invalid dates safely", () => {
    const elapsed = calculateLiveElapsedSeconds({
      startedAt: "invalid",
      endedAt: null,
      nowIso: "2026-03-09T10:00:00.000Z",
      breaks: [],
    });

    expect(elapsed).toBe(0);
  });

  it("triggers one-hour notification when threshold is passed and not yet notified", () => {
    expect(
      shouldTriggerOneHourNotification({
        elapsedSeconds: 3610,
        oneHourNotified: false,
      }),
    ).toBe(true);
  });

  it("does not trigger one-hour notification when already notified", () => {
    expect(
      shouldTriggerOneHourNotification({
        elapsedSeconds: 7200,
        oneHourNotified: true,
      }),
    ).toBe(false);
  });
});
