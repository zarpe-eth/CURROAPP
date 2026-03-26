import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/types/domain";

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

export function hasAdminPrivileges(profile: Pick<Profile, "role" | "email"> | null | undefined) {
  return profile?.role === "admin" || hasAdminPrivilegesFromEmail(profile?.email);
}

export function hasAdminPrivilegesFromEmail(email: string | null | undefined) {
  return normalizeEmail(email) === "silvestelar@gmail.com";
}

async function isAdminViaRpc(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_admin", { uid: userId });
  return Boolean(data);
}

export async function isUserAdmin(userId: string, authEmail?: string | null) {
  const profile = await getProfile(userId);

  if (hasAdminPrivileges(profile)) {
    return true;
  }

  if (hasAdminPrivilegesFromEmail(authEmail)) {
    return true;
  }

  return isAdminViaRpc(userId);
}

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
    .select("id,email,full_name,hourly_rate_eur,role")
    .eq("id", userId)
    .single();

  return data as Profile | null;
}

export async function getVisibleProfiles(currentUserId: string, authEmail?: string | null): Promise<Profile[]> {
  const currentProfile = await getProfile(currentUserId);
  const admin = await isUserAdmin(currentUserId, authEmail);

  if (!admin) {
    return currentProfile ? [currentProfile] : [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,hourly_rate_eur,role")
    .order("full_name", { ascending: true });

  return (data ?? []) as Profile[];
}

export async function assertAdmin(userId: string, authEmail?: string | null) {
  const admin = await isUserAdmin(userId, authEmail);
  if (!admin) {
    throw new Error("No autorizado");
  }
}

export function isAdmin(role: AppRole | undefined) {
  return role === "admin";
}

export function resolveSelectedUserId(
  currentUserId: string,
  selectableProfiles: Profile[],
  requestedUserId?: string,
) {
  const validIds = new Set(selectableProfiles.map((profile) => profile.id));
  if (requestedUserId && validIds.has(requestedUserId)) {
    return requestedUserId;
  }

  return currentUserId;
}
