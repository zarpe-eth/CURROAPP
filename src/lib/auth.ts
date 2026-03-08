import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/types/domain";

export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return data.user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", userId)
    .single();

  return data as Profile | null;
}

export async function assertAdmin(userId: string) {
  const profile = await getProfile(userId);
  if (!profile || profile.role !== "admin") {
    throw new Error("No autorizado");
  }
}

export function isAdmin(role: AppRole | undefined) {
  return role === "admin";
}

