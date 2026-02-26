import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isCurrentUserAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const { isAdmin, profileId: adminId } = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, amount, note } = body as {
    userId: string;
    amount: number;
    note?: string;
  };

  if (!userId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid userId or amount" }, { status: 400 });
  }

  const db = getServiceSupabase();

  // Fetch target user
  const { data: profile } = await db
    .from("profiles")
    .select("id, chips_balance, username")
    .eq("id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const newBalance = profile.chips_balance + amount;

  // Update balance
  await db
    .from("profiles")
    .update({ chips_balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", userId);

  // Record transaction
  await db.from("transactions").insert({
    user_id: userId,
    type: "admin_grant",
    amount,
    balance_after: newBalance,
    side: note || null,
  });

  return NextResponse.json({
    success: true,
    username: profile.username,
    amount,
    newBalance,
    adminId,
  });
}
