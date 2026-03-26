"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { markOneHourNotifiedAction } from "@/lib/actions/sessions";
import { formatDuration } from "@/lib/time/calc";
import { calculateLiveElapsedSeconds, shouldTriggerOneHourNotification } from "@/lib/time/live-session";
import type { SessionStatus, WorkBreak } from "@/types/domain";

type LiveTimerProps = {
  startedAt: string;
  endedAt: string | null;
  breaks: WorkBreak[];
  status: SessionStatus;
  sessionId: string;
  oneHourNotified: boolean;
  enableOneHourNotification: boolean;
};

export function LiveTimer({
  startedAt,
  endedAt,
  breaks,
  status,
  sessionId,
  oneHourNotified,
  enableOneHourNotification,
}: LiveTimerProps) {
  const [tick, setTick] = useState(() => Date.now());
  const [sessionNotified, setSessionNotified] = useState(oneHourNotified);
  const [inAppNotice, setInAppNotice] = useState(false);
  const notifyingRef = useRef(false);

  useEffect(() => {
    setSessionNotified(oneHourNotified);
    setInAppNotice(false);
  }, [oneHourNotified, sessionId]);

  useEffect(() => {
    if (status !== "active") return;

    const id = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, [status]);

  const seconds = useMemo(
    () =>
      calculateLiveElapsedSeconds({
        startedAt,
        endedAt,
        breaks,
        nowIso: new Date(tick).toISOString(),
      }),
    [startedAt, endedAt, breaks, tick],
  );

  useEffect(() => {
    if (!enableOneHourNotification || notifyingRef.current) {
      return;
    }

    if (
      !shouldTriggerOneHourNotification({
        elapsedSeconds: seconds,
        oneHourNotified: sessionNotified,
      })
    ) {
      return;
    }

    notifyingRef.current = true;

    const triggerNotice = async () => {
      try {
        const marked = await markOneHourNotifiedAction(sessionId);
        if (!marked) {
          return;
        }

        setSessionNotified(true);

        if (typeof window === "undefined" || typeof Notification === "undefined") {
          setInAppNotice(true);
          return;
        }

        if (Notification.permission === "granted") {
          new Notification("Ya llevas 1 hora trabajando.", {
            body: "Puedes terminar cuando corresponda.",
          });
          return;
        }

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            new Notification("Ya llevas 1 hora trabajando.", {
              body: "Puedes terminar cuando corresponda.",
            });
            return;
          }
        }

        setInAppNotice(true);
      } finally {
        notifyingRef.current = false;
      }
    };

    void triggerNotice();
  }, [enableOneHourNotification, seconds, sessionId, sessionNotified]);

  const value = useMemo(() => formatDuration(seconds), [seconds]);

  return (
    <div className="space-y-3">
      {inAppNotice ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Ya llevas 1 hora trabajando.</p>
          <p>Puedes terminar cuando corresponda.</p>
        </div>
      ) : null}
      <p className="font-mono text-5xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
