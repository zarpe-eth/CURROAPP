"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAppSettings } from "@/lib/data";
import { calculateEffectiveDurationSeconds, calculateMoneyFromSeconds } from "@/lib/time/calc";
import type { WorkBreak } from "@/types/domain";

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  return user.id;
}

export async function startSessionAction() {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const { data: existing } = await supabase
    .from("work_sessions")
    .select("id")
    .eq("user_id", userId)
    .is("ended_at", null)
    .in("status", ["active", "paused"])
    .maybeSingle();

  if (existing) {
    throw new Error("Ya tienes una jornada activa");
  }

  const { error } = await supabase.from("work_sessions").insert({
    user_id: userId,
    started_at: new Date().toISOString(),
    status: "active",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function pauseSessionAction() {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const { data: session } = await supabase
    .from("work_sessions")
    .select("id,status")
    .eq("user_id", userId)
    .is("ended_at", null)
    .eq("status", "active")
    .maybeSingle();

  if (!session) {
    throw new Error("No hay jornada activa para pausar");
  }

  const now = new Date().toISOString();

  const { error: breakError } = await supabase.from("work_breaks").insert({
    session_id: session.id,
    break_start: now,
  });

  if (breakError) {
    throw new Error(breakError.message);
  }

  const { error: sessionError } = await supabase
    .from("work_sessions")
    .update({ status: "paused" })
    .eq("id", session.id);

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  revalidatePath("/dashboard");
}

export async function resumeSessionAction() {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const { data: session } = await supabase
    .from("work_sessions")
    .select("id,status")
    .eq("user_id", userId)
    .is("ended_at", null)
    .eq("status", "paused")
    .maybeSingle();

  if (!session) {
    throw new Error("No hay jornada en pausa");
  }

  const { data: openBreak } = await supabase
    .from("work_breaks")
    .select("id,break_start")
    .eq("session_id", session.id)
    .is("break_end", null)
    .order("break_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!openBreak) {
    throw new Error("No hay pausa abierta para reanudar");
  }

  const now = new Date().toISOString();
  const durationSeconds = Math.max(
    0,
    Math.floor((new Date(now).getTime() - new Date(openBreak.break_start).getTime()) / 1000),
  );

  const { error: breakError } = await supabase
    .from("work_breaks")
    .update({ break_end: now, duration_seconds: durationSeconds })
    .eq("id", openBreak.id);

  if (breakError) {
    throw new Error(breakError.message);
  }

  const { error: sessionError } = await supabase
    .from("work_sessions")
    .update({ status: "active" })
    .eq("id", session.id);

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  revalidatePath("/dashboard");
}

export async function stopSessionAction() {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  const { hourly_rate_eur } = await getAppSettings();

  const { data: session } = await supabase
    .from("work_sessions")
    .select("*,work_breaks(*)")
    .eq("user_id", userId)
    .is("ended_at", null)
    .in("status", ["active", "paused"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) {
    throw new Error("No hay jornada activa");
  }

  const now = new Date().toISOString();
  const breaks = ((session.work_breaks ?? []) as WorkBreak[]).slice();

  if (session.status === "paused") {
    const openBreak = breaks.find((item) => !item.break_end);
    if (openBreak) {
      const durationSeconds = Math.max(
        0,
        Math.floor((new Date(now).getTime() - new Date(openBreak.break_start).getTime()) / 1000),
      );

      await supabase
        .from("work_breaks")
        .update({ break_end: now, duration_seconds: durationSeconds })
        .eq("id", openBreak.id);

      openBreak.break_end = now;
      openBreak.duration_seconds = durationSeconds;
    }
  }

  const effectiveSeconds = calculateEffectiveDurationSeconds(
    session.started_at,
    now,
    breaks,
    now,
  );

  const money = calculateMoneyFromSeconds(effectiveSeconds, hourly_rate_eur);

  const { error } = await supabase
    .from("work_sessions")
    .update({
      ended_at: now,
      status: "completed",
      duration_seconds: effectiveSeconds,
      money_earned: money,
    })
    .eq("id", session.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/monthly");
}

