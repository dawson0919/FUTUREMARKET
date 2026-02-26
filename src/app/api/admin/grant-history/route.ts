import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isCurrentUserAdmin } from "@/lib/admin";

export async function GET() {
  const { isAdmin } = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getServiceSupabase();

  const { data, error } = await db
    .from("transactions")
    .select("id, user_id, amount, balance_after, side, created_at, profile:profiles(username, avatar_url)")
    .eq("type", "admin_grant")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const history = (data || []).map((tx) => {
    const profile = Array.isArray(tx.profile) ? tx.profile[0] : tx.profile;
    return {
      id: tx.id,
      user_id: tx.user_id,
      username: profile?.username || null,
      avatar_url: profile?.avatar_url || null,
      amount: tx.amount,
      note: tx.side,
      created_at: tx.created_at,
    };
  });

  return NextResponse.json({ history });
}
