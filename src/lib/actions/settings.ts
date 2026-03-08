"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  await assertAdmin(user.id);

  const hourlyRate = Number(formData.get("hourly_rate_eur") ?? 8);
  const timezone = String(formData.get("timezone") ?? "Europe/Madrid");
  const employeeName = String(formData.get("employee_display_name") ?? "Javi").trim();

  const { data: existing } = await supabase.from("app_settings").select("id").limit(1).maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("app_settings")
      .update({ hourly_rate_eur: hourlyRate, timezone, employee_display_name: employeeName })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("app_settings").insert({
      hourly_rate_eur: hourlyRate,
      timezone,
      employee_display_name: employeeName,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

