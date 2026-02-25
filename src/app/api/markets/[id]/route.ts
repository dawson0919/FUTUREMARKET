import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("markets")
    .select("*, instrument:instruments(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  const market = {
    ...data,
    instrument: Array.isArray(data.instrument) ? data.instrument[0] : data.instrument,
  };

  return NextResponse.json({ market });
}
