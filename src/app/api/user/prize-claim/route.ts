import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  const clerkId = session?.user?.id;
  if (!clerkId) return NextResponse.json({ unclaimed: [] });

  const db = getServiceSupabase();

  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!profile) return NextResponse.json({ unclaimed: [] });

  const { data } = await db
    .from("competition_champions")
    .select("edition, title, prize, end_date, claimed_at")
    .eq("champion_user_id", profile.id)
    .is("claimed_at", null)
    .order("edition", { ascending: false });

  return NextResponse.json({ unclaimed: data || [] });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const clerkId = session?.user?.id;
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { edition } = await request.json();
  if (!edition) return NextResponse.json({ error: "Missing edition" }, { status: 400 });

  const db = getServiceSupabase();

  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { error } = await db
    .from("competition_champions")
    .update({ claimed_at: new Date().toISOString() })
    .eq("edition", edition)
    .eq("champion_user_id", profile.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
