"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function isMissingDailyTicketStatsTable(message: string | undefined) {
  return (message ?? "").includes("Could not find the table 'public.daily_ticket_stats'");
}

export async function upsertDailyTicketsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  await assertAdmin(user.id, user.email);

  const userId = String(formData.get("user_id") ?? "");
  const statDate = String(formData.get("stat_date") ?? "");
  const tickets = Number.parseInt(String(formData.get("tickets_resolved") ?? "0"), 10);

  if (!userId || !statDate) {
    throw new Error("Faltan datos para guardar tickets");
  }

  if (!Number.isFinite(tickets) || tickets < 0) {
    throw new Error("El numero de tickets debe ser 0 o mayor");
  }

  const { data: existing, error: existingError } = await supabase
    .from("daily_ticket_stats")
    .select("id")
    .eq("user_id", userId)
    .eq("stat_date", statDate)
    .maybeSingle();

  if (existingError && !isMissingDailyTicketStatsTable(existingError.message)) {
    redirect(`/team?saveError=${encodeURIComponent(existingError.message)}`);
  }

  if (existingError && isMissingDailyTicketStatsTable(existingError.message)) {
    const { error: legacyError } = await supabase.from("ticket_stats").upsert(
      {
        user_id: userId,
        stat_date: statDate,
        tickets_responded: tickets,
        source: "manual",
      },
      { onConflict: "user_id,stat_date" },
    );

    if (legacyError) {
      redirect(`/team?saveError=${encodeURIComponent(legacyError.message)}`);
    }
  } else if (existing?.id) {
    const { error: updateError } = await supabase
      .from("daily_ticket_stats")
      .update({ tickets_resolved: tickets })
      .eq("id", existing.id);

    if (updateError) {
      redirect(`/team?saveError=${encodeURIComponent(updateError.message)}`);
    }
  } else {
    const { error: insertError } = await supabase.from("daily_ticket_stats").insert({
      user_id: userId,
      stat_date: statDate,
      tickets_resolved: tickets,
      created_by: user.id,
    });

    if (insertError) {
      redirect(`/team?saveError=${encodeURIComponent(insertError.message)}`);
    }
  }

  revalidatePath("/team");
  redirect(`/team?saveOk=1&userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(statDate)}`);
}
