import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isCurrentUserAdmin } from "@/lib/admin";

const COMPETITION_CHIPS = 100000;

export async function POST() {
  const { isAdmin } = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getServiceSupabase();

  const { data: profiles } = await db.from("profiles").select("id");

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: "No users found" }, { status: 404 });
  }

  let reset = 0;

  for (const profile of profiles) {
    await db
      .from("profiles")
      .update({ chips_balance: COMPETITION_CHIPS, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    await db.from("transactions").insert({
      user_id: profile.id,
      type: "admin_grant",
      amount: COMPETITION_CHIPS,
      balance_after: COMPETITION_CHIPS,
      side: "第一屆刀神海期教室比賽開始，統一重置籌碼",
    });

    reset++;
  }

  return NextResponse.json({ success: true, reset, chips: COMPETITION_CHIPS });
}
