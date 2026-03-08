"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");

  if (!password || password.length < 8) {
    redirect("/settings?pwError=La+contrase%C3%B1a+debe+tener+al+menos+8+caracteres");
  }

  if (password !== passwordConfirm) {
    redirect("/settings?pwError=Las+contrase%C3%B1as+no+coinciden");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/settings?pwError=${encodeURIComponent(error.message)}`);
  }

  redirect("/settings?pwOk=Contrase%C3%B1a+actualizada");
}

