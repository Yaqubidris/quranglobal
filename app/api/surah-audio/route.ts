import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reciterId = searchParams.get("reciterId");
  const surahId = searchParams.get("surahId");

  if (!reciterId || !surahId) {
    return Response.json({ error: "Missing reciterId or surahId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reciter_surahs")
    .select("audio_path")
    .eq("reciter_id", reciterId)
    .eq("surah_id", surahId)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    audio_path: data?.audio_path ?? null,
  });
}
