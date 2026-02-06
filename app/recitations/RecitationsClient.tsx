"use client";
import { addRecentlyPlayed } from "@/lib/recentlyPlayed";

import React from "react";

type Reciter = {
  id: string | number;
  name: string;
  country: string;
  region: string;
};

type Surah = {
  id: number;
  name_en: string;
  name_ar: string | null;
};

type ReciterSurahRow = {
  surah_id: number;
  audio_path: string | null;
};

function safeLower(s: string | null | undefined) {
  return (s ?? "").toLowerCase();
}

export default function RecitationsClient({
  reciters,
  surahs,
  initialReciterId,
  initialReciterSurahs,
}: {
  reciters: Reciter[];
  surahs: Surah[];
  initialReciterId: string;
  initialReciterSurahs: ReciterSurahRow[];
}) {
  const safeReciters = Array.isArray(reciters) ? reciters : [];
  const safeSurahs = Array.isArray(surahs) ? surahs : [];

  const [reciterId, setReciterId] = React.useState(initialReciterId);
  const [q, setQ] = React.useState("");
  const [onlyAvailable, setOnlyAvailable] = React.useState(true);

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Audio player state
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentSurahId, setCurrentSurahId] = React.useState<number | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Reciter surahs (audio rows)
  const [reciterSurahs, setReciterSurahs] =
    React.useState<ReciterSurahRow[]>(Array.isArray(initialReciterSurahs) ? initialReciterSurahs : []);

  // Fetch new audio rows when reciter changes
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!reciterId) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(`/api/reciter-surahs?reciterId=${encodeURIComponent(reciterId)}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error || "Failed to load reciter surahs");

        const rows = Array.isArray(json?.rows) ? (json.rows as ReciterSurahRow[]) : [];
        if (!cancelled) {
          setReciterSurahs(rows);

          // Stop current audio when switching reciter
          const audio = audioRef.current;
          if (audio) {
            audio.pause();
            audio.src = "";
          }
          setIsPlaying(false);
          setCurrentSurahId(null);
        }
      } catch (e: any) {
        if (!cancelled) setErrorMsg(e?.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reciterId]);

  // Map surah_id -> audio URL/path
  const audioMap = React.useMemo(() => {
    const m = new Map<number, string>();
    const rows = Array.isArray(reciterSurahs) ? reciterSurahs : [];

    for (const row of rows) {
      const url = row?.audio_path ?? null;
      if (url) m.set(row.surah_id, url);
    }
    return m;
  }, [reciterSurahs]);

  // Filter list
  const list = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    return safeSurahs.filter((s) => {
      const matchesSearch =
        query === "" ||
        safeLower(s.name_en).includes(query) ||
        safeLower(s.name_ar).includes(query) ||
        String(s.id).includes(query);

      const hasAudio = audioMap.has(s.id);
      return matchesSearch && (!onlyAvailable || hasAudio);
    });
  }, [q, onlyAvailable, safeSurahs, audioMap]);

  const playableIds = React.useMemo(() => {
    return list.filter((s) => audioMap.has(s.id)).map((s) => s.id);
  }, [list, audioMap]);

  const playSurah = React.useCallback(
    (surahId: number) => {
      const url = audioMap.get(surahId);
      if (!url) return;

      const audio = audioRef.current;
      if (!audio) return;

      if (currentSurahId !== surahId) {
        audio.src = url;
        setCurrentSurahId(surahId);
      }
function playSurah(surahId: number) {
  const url = audioMap.get(surahId);
  if (!url) return;

  const audio = audioRef.current;
  if (!audio) return;

  if (currentSurahId !== surahId) {
    audio.src = url;
    setCurrentSurahId(surahId);
  }

  // ✅ save to Recently Played
  const s = surahs.find((x) => x.id === surahId);
  const r = reciters.find((x) => String(x.id) === String(reciterId));
  addRecentlyPlayed({
    surahId,
    surahNameEn: s?.name_en ?? `Surah ${surahId}`,
    reciterId: String(reciterId),
    reciterName: r?.name ?? "Unknown Reciter",
    audioPath: url,
    playedAt: Date.now(),
  });

  audio
    .play()
    .then(() => setIsPlaying(true))
    .catch(() => setIsPlaying(false));
}

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    },
    [audioMap, currentSurahId]
  );

  const pause = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = React.useCallback(
    (surahId: number) => {
      if (currentSurahId === surahId && isPlaying) pause();
      else playSurah(surahId);
    },
    [currentSurahId, isPlaying, pause, playSurah]
  );

  const playNext = React.useCallback(() => {
    if (playableIds.length === 0) return;
    if (currentSurahId == null) return playSurah(playableIds[0]);

    const idx = playableIds.indexOf(currentSurahId);
    const nextId = playableIds[Math.min(idx + 1, playableIds.length - 1)];
    playSurah(nextId);
  }, [playableIds, currentSurahId, playSurah]);

  const playPrev = React.useCallback(() => {
    if (playableIds.length === 0) return;
    if (currentSurahId == null) return playSurah(playableIds[0]);

    const idx = playableIds.indexOf(currentSurahId);
    const prevId = playableIds[Math.max(idx - 1, 0)];
    playSurah(prevId);
  }, [playableIds, currentSurahId, playSurah]);

  // When audio ends -> next
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [playNext]);

  const currentReciter = safeReciters.find((r) => String(r.id) === String(reciterId));
  const nowPlaying = currentSurahId ? safeSurahs.find((s) => s.id === currentSurahId) : null;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-5 sm:p-6 bg-gradient-to-b from-white to-zinc-50">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Reciter select */}
            <div className="w-full lg:max-w-sm">
              <label className="text-xs font-semibold text-zinc-500">Selected Reciter</label>
              <select
                value={reciterId}
                onChange={(e) => setReciterId(e.target.value)}
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
                <p className="mt-2 text-xs text-zinc-500">
                  {currentReciter.region} • {currentReciter.country}
                </p>
              ) : null}

              {loading ? <p className="mt-2 text-xs text-emerald-700">Loading recitations…</p> : null}
              {errorMsg ? <p className="mt-2 text-xs text-red-600">❌ {errorMsg}</p> : null}
            </div>

            {/* Search */}
            <div className="w-full lg:max-w-md">
              <label className="text-xs font-semibold text-zinc-500">Search</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search surah name or number (e.g. 1, Fatiha, الفاتحة)"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Only available */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Only with recitations
              </label>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">
                {list.length} Surah{list.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-5 sm:p-6">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-zinc-700">
            No surahs matched your search/filters.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 overflow-hidden">
            {list.map((s) => {
              const url = audioMap.get(s.id) ?? null;
              const hasAudio = !!url;
              const active = currentSurahId === s.id;

              return (
                <div key={s.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900">
                      <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
                        {s.id}
                      </span>
                      {s.name_en}
                      {s.name_ar ? (
                        <span className="ml-2 text-zinc-500 font-normal">• {s.name_ar}</span>
                      ) : null}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {hasAudio ? "Recitation available" : "No recitation uploaded yet"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={!hasAudio}
                      onClick={() => togglePlay(s.id)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition border
                        ${
                          hasAudio
                            ? active && isPlaying
                              ? "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
                              : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                            : "bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed"
                        }`}
                    >
                      {!hasAudio ? "No audio" : active && isPlaying ? "Pause" : "Play"}
                    </button>

                    {hasAudio ? (
                      <a
                        href={url ?? "#"}
                        download
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition"
                      >
                        Download
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Player Bar */}
      <div className="border-t border-zinc-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-500">Now playing</p>
            <p className="truncate font-semibold text-zinc-900">
              {nowPlaying ? `${nowPlaying.id}. ${nowPlaying.name_en}` : "Nothing playing yet"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={playPrev}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition"
            >
              Prev
            </button>
            <button
              onClick={playNext}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition"
            >
              Next
            </button>
          </div>
        </div>

        <audio ref={audioRef} className="mt-3 w-full" controls />
      </div>
    </div>
  );
}
