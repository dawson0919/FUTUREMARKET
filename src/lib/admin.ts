import { auth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function isCurrentUserAdmin(): Promise<{
  isAdmin: boolean;
  userId: string | null;
  profileId: string | null;
}> {
  const { userId } = await auth();
  if (!userId) return { isAdmin: false, userId: null, profileId: null };

  const db = getServiceSupabase();
  const { data: profile } = await db
    .from("profiles")
    .select("id, is_admin")
    .eq("clerk_id", userId)
    .single();

  return {
    isAdmin: profile?.is_admin ?? false,
    userId,
    profileId: profile?.id ?? null,
  };
}
