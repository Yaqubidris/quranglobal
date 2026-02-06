"use client";

import { useMemo, useRef, useState } from "react";

type Row = {
  id: number | string;
  surah_id: number;
  audio_path: string | null;
  surahs?: {
    name_en?: string | null;
    name_ar?: string | null;
  } | null;
};

export default function PlaylistPlayer({
  reciterName,
  rows,
}: {
  reciterName: string;
  rows: Row[];
}) {
  const list = useMemo(() => {
    return (rows ?? [])
      .filter((r) => r.audio_path)
      .map((r) => ({
        key: String(r.id),
        surahId: r.surah_id,
        titleEn: r.surahs?.name_en ?? `Surah ${r.surah_id}`,
        titleAr: r.surahs?.name_ar ?? "",
        audio: r.audio_path as string,
      }));
  }, [rows]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const current = currentIndex >= 0 ? list[currentIndex] : null;

  function playIndex(i: number) {
    if (!audioRef.current) return;
    if (i < 0 || i >= list.length) return;

    setCurrentIndex(i);
    const track = list[i];

    // if audio_path is a full URL, it will work as-is
    audioRef.current.src = track.audio;
    audioRef.current.play();
    setIsPlaying(true);
  }

  function togglePlay(i: number) {
    if (!audioRef.current) return;

    if (currentIndex === i) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    playIndex(i);
  }

  function next() {
    if (list.length === 0) return;
    const i = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, list.length - 1);
    playIndex(i);
  }

  function prev() {
    if (list.length === 0) return;
    const i = currentIndex <= 0 ? 0 : currentIndex - 1;
    playIndex(i);
  }

  return (
    <div className="space-y-4">
      {/* Track list */}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600">
          No surah audio uploaded for this reciter yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <p className="text-sm font-semibold text-zinc-900">Playlist</p>
            <p className="text-xs text-zinc-500">{list.length} tracks</p>
          </div>

          <div className="divide-y divide-zinc-100">
            {list.map((t, i) => {
              const active = i === currentIndex;
              return (
                <button
                  key={t.key}
                  onClick={() => togglePlay(i)}
                  className={`w-full text-left px-5 py-4 transition hover:bg-zinc-50 ${
                    active ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-semibold ${
                        active
                          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                          : "border-zinc-200 bg-white text-zinc-800"
                      }`}
                    >
                      {active && isPlaying ? "❚❚" : "▶"}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-zinc-900">
                          {String(t.surahId).padStart(3, "0")} • {t.titleEn}
                        </p>
                        {t.titleAr ? (
                          <p className="hidden text-sm text-zinc-600 sm:block">
                            {t.titleAr}
                          </p>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        Tap to {active && isPlaying ? "pause" : "play"}
                      </p>
                    </div>

                    {/* Download */}
                    <a
                      href={t.audio}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
                      title="Download"
                    >
                      ⬇
                    </a>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky player */}
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
        <div className="mx-auto max-w-6xl rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-500">Now playing</p>
              <p className="truncate text-sm font-semibold text-zinc-900">
                {current
                  ? `${String(current.surahId).padStart(3, "0")} • ${current.titleEn} — ${reciterName}`
                  : `Select a surah to start — ${reciterName}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
              >
                ⟵
              </button>

              <button
                onClick={() => {
                  if (currentIndex < 0 && list.length > 0) playIndex(0);
                  else if (currentIndex >= 0) togglePlay(currentIndex);
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {currentIndex >= 0 && isPlaying ? "Pause" : "Play"}
              </button>

              <button
                onClick={next}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
              >
                ⟶
              </button>
            </div>
          </div>

          <audio
            ref={audioRef}
            className="mt-3 w-full"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => next()}
          />
        </div>
      </div>
    </div>
  );
}
