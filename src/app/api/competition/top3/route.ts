import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, chips_balance")
    .order("chips_balance", { ascending: false })
    .limit(3);

  return NextResponse.json({ top3: data || [] });
}
