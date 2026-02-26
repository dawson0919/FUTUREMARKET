import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isCurrentUserAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const { isAdmin } = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const search = request.nextUrl.searchParams.get("search") || "";
  const db = getServiceSupabase();

  let query = db
    .from("profiles")
    .select("id, clerk_id, username, avatar_url, chips_balance, total_trades, wins, losses, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (search) {
    query = query.ilike("username", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data || [] });
}
