import "server-only";

import { createServerSupabaseClient } from "@/lib/db/server";
import { dbAdmin } from "@/lib/db/server-only";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } =
    await dbAdmin
      .from("profiles")
      .select("role, onboarded, deleted_at")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile || profile.deleted_at) {
    return null;
  }

  return {
    userId: user.id,
    role: profile.role ?? "student",
    onboarded: Boolean(profile.onboarded),
  };
}