import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminFromRequest } from "@/lib/requireAdmin";

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

export async function POST(req: Request) {
  // 1) Verify user is logged in
  const auth = await requireAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  // 2) Read form data
  const form = await req.formData();
  const reciterId = String(form.get("reciterId") ?? "");
  const surahIdRaw = String(form.get("surahId") ?? "");
  const file = form.get("file");

  const surahId = Number(surahIdRaw);

  if (!reciterId || !surahIdRaw || !Number.isFinite(surahId)) {
    return NextResponse.json({ error: "reciterId and surahId are required" }, { status: 400 });
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "MP3 file is required" }, { status: 400 });
  }

  // Optional: basic file type guard
  const filename = file.name.toLowerCase();
  const looksLikeMp3 =
    file.type === "audio/mpeg" ||
    filename.endsWith(".mp3") ||
    filename.endsWith(".mpeg");

  if (!looksLikeMp3) {
    return NextResponse.json({ error: "Please upload an MP3 file" }, { status: 400 });
  }

  // 3) Create admin supabase client (service role)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Server env not set (SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 }
    );
  }

  const admin = createClient(url, serviceKey);

  // 4) Upload to Storage
  // bucket: quran-audio (public: yes)
  // path: audio/<reciterId>/<surahId>.mp3
  const objectPath = `audio/${reciterId}/${pad3(surahId)}.mp3`;

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const upload = await admin.storage
    .from("quran-audio")
    .upload(objectPath, bytes, {
      contentType: "audio/mpeg",
      upsert: true, // overwrite if same file path exists
    });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 400 });
  }

  // 5) Get public URL (bucket is public)
  const { data: pub } = admin.storage.from("quran-audio").getPublicUrl(objectPath);
  const publicUrl = pub.publicUrl;

  // 6) Insert/Upsert into reciter_surahs table
  // Your table:
  // reciter_id bigint
  // surah_id smallint
  // audio_path text
  //
  // We'll store FULL URL in audio_path (easy for playback)
  const db = await admin
    .from("reciter_surahs")
    .upsert(
      {
        reciter_id: reciterId,
        surah_id: surahId,
        audio_path: publicUrl,
      },
      { onConflict: "reciter_id,surah_id" }
    )
    .select("id, reciter_id, surah_id, audio_path")
    .single();

  if (db.error) {
    return NextResponse.json({ error: db.error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Uploaded and saved!",
    row: db.data,
  });
}
