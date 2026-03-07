import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

function getCheckinReward(streak: number): number {
  if (streak >= 30) return 20000;
  if (streak >= 7) return 5000;
  if (streak >= 3) return 2000;
  return 1000;
}

function getTodayDateString(): string {
  // Use UTC+8 (Taiwan time) for date calculation
  const now = new Date();
  const tw = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return tw.toISOString().split("T")[0];
}

function getYesterdayDateString(): string {
  const now = new Date();
  const tw = new Date(now.getTime() + 8 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  return tw.toISOString().split("T")[0];
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, chips_balance, last_checkin_date, checkin_streak")
    .eq("clerk_id", userId)
    .single();

  if (!profile || profileError) {
    return NextResponse.json({ error: "找不到用戶資料" }, { status: 404 });
  }

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Already checked in today
  if (profile.last_checkin_date === today) {
    return NextResponse.json({
      status: "already_checked_in",
      streak: profile.checkin_streak,
      nextReward: getCheckinReward(profile.checkin_streak + 1),
    });
  }

  // Calculate new streak
  let newStreak: number;
  if (profile.last_checkin_date === yesterday) {
    newStreak = (profile.checkin_streak || 0) + 1;
  } else {
    newStreak = 1;
  }

  const reward = getCheckinReward(newStreak);
  const newBalance = profile.chips_balance + reward;

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      last_checkin_date: today,
      checkin_streak: newStreak,
      chips_balance: newBalance,
    })
    .eq("id", profile.id);

  if (updateError) {
    return NextResponse.json({ error: "簽到失敗" }, { status: 500 });
  }

  // Record transaction
  await supabase.from("transactions").insert({
    user_id: profile.id,
    type: "checkin",
    amount: reward,
    balance_after: newBalance,
    market_id: null,
    side: null,
  });

  return NextResponse.json({
    status: "success",
    reward,
    streak: newStreak,
    nextReward: getCheckinReward(newStreak + 1),
    balance: newBalance,
  });
}
