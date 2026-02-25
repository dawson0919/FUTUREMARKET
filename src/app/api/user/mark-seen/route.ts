import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { positionIds } = await request.json();
  if (!Array.isArray(positionIds) || positionIds.length === 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Get user profile to verify ownership
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Mark positions as seen (only the user's own positions)
  await supabase
    .from("positions")
    .update({ result_seen: true })
    .eq("user_id", profile.id)
    .in("id", positionIds);

  return NextResponse.json({ success: true });
}
