import { supabase } from "@/lib/supabaseClient";

const BUCKET = "quran-audio";

export async function uploadRecitationAudio(params: {
  file: File;
  reciterId: string;
  surahId: number;
}) {
  const { file, reciterId, surahId } = params;

  // nice file name like 001.mp3
  const padded = String(surahId).padStart(3, "0");
  const ext = file.name.split(".").pop() || "mp3";

  const path = `audio/${reciterId}/${padded}.${ext}`;

  // Upload (upsert true means "replace if exists")
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "audio/mpeg",
      cacheControl: "3600",
    });

  if (uploadError) throw new Error(uploadError.message);

  // Get PUBLIC URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const publicUrl = data.publicUrl;

  return { path, publicUrl };
}
