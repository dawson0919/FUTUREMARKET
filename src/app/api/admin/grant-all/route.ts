import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isCurrentUserAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const { isAdmin } = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { amount, note } = body as { amount: number; note: string };

  if (!amount || amount <= 0 || !note) {
    return NextResponse.json({ error: "Amount and note are required" }, { status: 400 });
  }

  const db = getServiceSupabase();

  // Get all users
  const { data: profiles } = await db
    .from("profiles")
    .select("id, chips_balance");

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: "No users found" }, { status: 404 });
  }

  let granted = 0;

  for (const profile of profiles) {
    const newBalance = profile.chips_balance + amount;

    await db
      .from("profiles")
      .update({ chips_balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    await db.from("transactions").insert({
      user_id: profile.id,
      type: "admin_grant",
      amount,
      balance_after: newBalance,
      side: note,
    });

    granted++;
  }

  return NextResponse.json({
    success: true,
    granted,
    amount,
    note,
  });
}
