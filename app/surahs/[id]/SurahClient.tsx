"use client";
import { addRecentlyPlayed } from "@/lib/recentlyPlayed";

import React from "react";

type Reciter = {
  id: string | number;
  name: string;
  country: string;
  region: string;
};

export default function SurahClient({
  surahId,
  surahNameEn,
  reciters,
  initialReciterId,
  initialAudioPath,
}: {
  surahId: number;
  surahNameEn: string;
  reciters: Reciter[];
  initialReciterId: string;
  initialAudioPath: string | null;
}) {
  const safeReciters = Array.isArray(reciters) ? reciters : [];

  const [reciterId, setReciterId] = React.useState(initialReciterId);
  const [audioPath, setAudioPath] = React.useState<string | null>(initialAudioPath);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentReciter = safeReciters.find((r) => String(r.id) === String(reciterId));
  const hasAudio = !!audioPath;

  function pad3(n: number) {
    return String(n).padStart(3, "0");
  }

  async function fetchAudio(nextReciterId: string) {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(
        `/api/surah-audio?reciterId=${encodeURIComponent(nextReciterId)}&surahId=${encodeURIComponent(
          String(surahId)
        )}`
      );

      const json = await res.json();

      if (!res.ok) {
        setAudioPath(null);
        setMsg(json?.error ?? "Failed to fetch audio");
        return;
      }

      const path = (json?.audio_path ?? null) as string | null;
      setAudioPath(path);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = path ?? "";
      }

      if (!path) setMsg("No audio uploaded for this reciter + surah yet.");
    } catch {
      setAudioPath(null);
      setMsg("Network error while fetching audio.");
    } finally {
      setLoading(false);
    }
  }

  function handleReciterChange(value: string) {
    setReciterId(value);
    fetchAudio(value);
  }
function handlePlay() {
  if (!audioRef.current || !audioPath) return;

  audioRef.current.play().catch(() => {
    setMsg("Browser blocked autoplay. Click play again.");
  });

  // ✅ save to Recently Played (localStorage)
  try {
    const key = "qg_recently_played";
    const item = {
      type: "surah",
      surahId,
      surahNameEn,
      reciterId,
      reciterName: currentReciter?.name ?? null,
      audioPath,
      ts: Date.now(),
    };

    const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
    const arr = Array.isArray(prev) ? prev : [];

    // remove duplicates (same surah + reciter)
    const filtered = arr.filter(
      (x: any) => !(x?.surahId === surahId && String(x?.reciterId) === String(reciterId))
    );

    filtered.unshift(item);
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, 30)));
  } catch {
    // ignore
  }
}



  // If reciters list changes and current selection is empty, pick first
  React.useEffect(() => {
    if (safeReciters.length === 0) return;
    if (!reciterId) {
      const first = String(safeReciters[0].id);
      setReciterId(first);
    }
  }, [safeReciters, reciterId]);

  if (safeReciters.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-500">Surah {pad3(surahId)}</p>
              <h2 className="mt-1 text-xl font-bold text-zinc-900">{surahNameEn}</h2>
              <p className="mt-2 text-sm text-zinc-600">
                There are currently no uploaded audios for this surah.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700">
              No audio
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Upload at least one row in <b>reciter_surahs</b> for surah <b>{surahId}</b> with a valid{" "}
            <b>audio_path</b> URL.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Header / Top */}
      <div className="relative p-5 sm:p-6 bg-gradient-to-b from-white to-zinc-50">
        {/* subtle glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative">
          {/* Title row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                  Surah {pad3(surahId)}
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${
                    hasAudio
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600"
                  }`}
                  title={hasAudio ? "Audio available" : "No audio yet"}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${hasAudio ? "bg-emerald-500" : "bg-zinc-300"}`} />
                  {hasAudio ? "Audio available" : "No audio"}
                </span>

                {loading ? (
                  <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                    Loading…
                  </span>
                ) : null}
              </div>

              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 truncate">
                {surahNameEn}
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Pick a reciter, then play or download the recitation for this surah.
              </p>
            </div>

            {/* Primary actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePlay}
                disabled={!audioPath || loading}
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700
                           disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Loading..." : audioPath ? "Play" : "No audio"}
              </button>

              {audioPath ? (
                <a
                  href={audioPath}
                  download
                  className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50 transition"
                >
                  Download
                </a>
              ) : null}
            </div>
          </div>

          {/* Message */}
          {msg ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {msg}
            </div>
          ) : null}

          {/* Reciter select + info */}
          <div className="mt-6 grid gap-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">

              <label className="text-xs font-semibold text-zinc-500">Choose Reciter</label>

              <select
                value={reciterId}
                onChange={(e) => handleReciterChange(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                {safeReciters.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.name} — {r.country}
                  </option>
                ))}
              </select>

              {currentReciter ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-semibold text-zinc-700">
                    {currentReciter.region}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-semibold text-zinc-700">
                    {currentReciter.country}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-xs text-zinc-500">Select a reciter to continue.</p>
              )}

              {/* Chips */}
              <div className="mt-5">
                <p className="text-xs font-semibold text-zinc-500">Available reciters</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {safeReciters.map((r) => {
                    const active = String(r.id) === String(reciterId);
                    return (
                      <button
                        key={String(r.id)}
                        onClick={() => handleReciterChange(String(r.id))}
                        className={`rounded-full px-4 py-2 text-sm border transition
                          ${
                            active
                              ? "bg-zinc-900 text-white border-zinc-900"
                              : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                          }`}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Player */}
      <div className="p-5 sm:p-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-500">Now Playing</p>
              <p className="mt-1 font-semibold text-zinc-900 truncate">
                Surah {surahId}: {surahNameEn}
              </p>
              {currentReciter ? (
                <p className="mt-1 text-sm text-zinc-600 truncate">
                  Reciter: <span className="font-semibold text-zinc-900">{currentReciter.name}</span>
                </p>
              ) : null}
            </div>

            <div
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold border ${
                hasAudio
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600"
              }`}
            >
              {hasAudio ? "Playable" : "No audio"}
            </div>
          </div>

          <audio ref={audioRef} className="mt-4 w-full" controls src={audioPath ?? ""} />
        </div>
      </div>
    </div>
  );
}
