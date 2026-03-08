"use client";

import { useTransition } from "react";
import { Pause, Play, Square, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  pauseSessionAction,
  resumeSessionAction,
  startSessionAction,
  stopSessionAction,
} from "@/lib/actions/sessions";
import type { SessionStatus } from "@/types/domain";

type SessionControlsProps = {
  status: SessionStatus | "idle";
};

export function SessionControls({ status }: SessionControlsProps) {
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<void>) => {
    startTransition(async () => {
      await action();
    });
  };

  if (status === "idle") {
    return (
      <Button size="lg" className="w-full md:w-auto" onClick={() => run(startSessionAction)} disabled={isPending}>
        <Timer className="mr-2 size-5" /> Empezar jornada
      </Button>
    );
  }

  if (status === "active") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button size="lg" className="min-w-48" onClick={() => run(pauseSessionAction)} disabled={isPending}>
          <Pause className="mr-2 size-5" /> Pausar jornada
        </Button>
        <Button size="lg" variant="outline" className="min-w-48" onClick={() => run(stopSessionAction)} disabled={isPending}>
          <Square className="mr-2 size-5" /> Terminar jornada
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button size="lg" className="min-w-48" onClick={() => run(resumeSessionAction)} disabled={isPending}>
        <Play className="mr-2 size-5" /> Reanudar jornada
      </Button>
      <Button size="lg" variant="outline" className="min-w-48" onClick={() => run(stopSessionAction)} disabled={isPending}>
        <Square className="mr-2 size-5" /> Terminar jornada
      </Button>
    </div>
  );
}

