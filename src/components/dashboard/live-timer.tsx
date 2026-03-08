"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDuration } from "@/lib/time/calc";

type LiveTimerProps = {
  initialSeconds: number;
  isRunning: boolean;
};

export function LiveTimer({ initialSeconds, isRunning }: LiveTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  const value = useMemo(() => formatDuration(seconds), [seconds]);

  return <p className="font-mono text-5xl font-semibold tracking-tight text-foreground">{value}</p>;
}

