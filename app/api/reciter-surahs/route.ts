import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reciterId = searchParams.get("reciterId");

  if (!reciterId) {
    return NextResponse.json({ error: "reciterId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reciter_surahs")
    .select("surah_id, audio_path")
    .eq("reciter_id", reciterId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}
