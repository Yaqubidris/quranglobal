"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Reciter, Surah, UploadRow } from "@/lib/types";

const BUCKET = "quran-audio";

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

export default function UploadClient({
  reciters,
  surahs,
  initialHistory,
}: {
  reciters: Reciter[];
  surahs: Surah[];
  initialHistory: UploadRow[];
}) {
  const router = useRouter();

  const safeReciters = Array.isArray(reciters) ? reciters : [];
  const safeSurahs = Array.isArray(surahs) ? surahs : [];

  const [checking, setChecking] = React.useState(true);

  const [reciterId, setReciterId] = React.useState<string>(
    safeReciters[0]?.id ? String(safeReciters[0].id) : ""
  );
  const [surahId, setSurahId] = React.useState<string>(
    safeSurahs[0]?.id ? String(safeSurahs[0].id) : ""
  );

  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const [history, setHistory] = React.useState<UploadRow[]>(
    Array.isArray(initialHistory) ? initialHistory : []
  );
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  // ✅ Require auth (admin) here
  React.useEffect(() => {
    let mounted = true;

    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      if (mounted) setChecking(false);
    }

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function loadHistory() {
    setLoadingHistory(true);

    const { data, error } = await supabase
      .from("reciter_surahs")
      .select(
        "id, created_at, reciter_id, surah_id, audio_path, reciter:reciters(name), surah:surahs(name_en, name_ar)"
      )
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error) setHistory((data ?? []) as unknown as UploadRow[]);
    setLoadingHistory(false);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!reciterId) return setMsg("Select a reciter.");
    if (!surahId) return setMsg("Select a surah.");
    if (!file) return setMsg("Choose an MP3 file.");

    const rId = String(reciterId).trim();
    const sId = Number(surahId);

    // ✅ Storage path convention: audio/<reciterId>/<surahId>.mp3
    const objectPath = `audio/${rId}/${pad3(sId)}.mp3`;

    try {
      setUploading(true);

      // 1) Upload to storage (overwrite by using upsert: true)
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "audio/mpeg",
        });

      if (uploadErr) throw uploadErr;

      // 2) Get public URL (since bucket is public)
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
      const publicUrl = pub.publicUrl;

      // 3) Save link into DB (upsert by unique(reciter_id, surah_id))
      const { error: dbErr } = await supabase.from("reciter_surahs").upsert(
        {
          reciter_id: Number(rId),
          surah_id: sId,
          audio_path: publicUrl,
        },
        { onConflict: "reciter_id,surah_id" }
      );

      if (dbErr) throw dbErr;

      setMsg("✅ Upload successful and saved to database.");
      setFile(null);

      // refresh history
      await loadHistory();
    } catch (err: any) {
      setMsg(`❌ Upload failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  }

  if (checking) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-6">
        Checking session...
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Upload Form */}
      <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-b from-white to-zinc-50 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">Upload MP3</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Upload to <b>{BUCKET}</b> and link to Reciter + Surah.
          </p>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-zinc-600">Reciter</label>
              <select
                value={reciterId}
                onChange={(e) => setReciterId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                {safeReciters.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.name} — {r.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600">Surah</label>
              <select
                value={surahId}
                onChange={(e) => setSurahId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                {safeSurahs.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.id}. {s.name_en} {s.name_ar ? `— ${s.name_ar}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-600">MP3 File</label>
            <input
              type="file"
              accept="audio/mpeg,audio/mp3"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Path used: <b>audio/{reciterId || "RECITER"}/{pad3(Number(surahId || 0))}.mp3</b>
            </p>
          </div>

          {msg ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {msg}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              disabled={uploading}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            <button
              type="button"
              onClick={loadHistory}
              disabled={loadingHistory}
              className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingHistory ? "Refreshing..." : "Refresh History"}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-b from-white to-zinc-50 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Uploads</h2>
          <p className="mt-1 text-sm text-zinc-600">Last 30 uploads.</p>
        </div>

        <div className="p-4">
          {loadingHistory ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
              Loading...
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
              No uploads yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 overflow-hidden">
              {history.map((h) => (
                <div key={h.id} className="p-4">
                  <p className="text-sm font-semibold text-zinc-900">
                    {h.reciter?.name ?? `Reciter ${h.reciter_id}`} —{" "}
                    {h.surah ? `${h.surah_id}. ${h.surah.name_en}` : `Surah ${h.surah_id}`}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(h.created_at).toLocaleString()}
                  </p>

                  <a
                    href={h.audio_path}
                    target="_blank"
                    className="mt-3 inline-flex rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
                  >
                    Open audio
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
