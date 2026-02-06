import { supabase } from "@/lib/supabaseClient";

export async function saveReciterSurah(params: {
  reciterId: string;
  surahId: number;
  audioPath: string; // we will store the public URL here
}) {
  const { reciterId, surahId, audioPath } = params;

  const { error } = await supabase.from("reciter_surahs").upsert(
    {
      reciter_id: Number(reciterId),
      surah_id: surahId,
      audio_path: audioPath,
    },
    { onConflict: "reciter_id,surah_id" }
  );

  if (error) throw new Error(error.message);
}
