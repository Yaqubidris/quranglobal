import { supabase } from "@/lib/supabaseClient";

export function getReciterImageUrl(image_path?: string | null) {
  if (!image_path) return null;

  const { data } = supabase.storage
    .from("reciters") // ✅ change this to your bucket name
    .getPublicUrl(image_path);

  return data.publicUrl;
}
