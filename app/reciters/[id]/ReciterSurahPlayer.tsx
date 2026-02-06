"use client";

import React from "react";

type Surah = {
  id: number;
  name_en: string;
  name_ar: string | null;
};

export default function ReciterSurahPlayer({
  surahs,
  audioMap,
}: {
  surahs: Surah[];
  audioMap: Record<number, string>;
}) {
  const safeSurahs = Array.isArray(surahs) ? surahs : [];
  const map = audioMap ?? {};

  const list = React.useMemo(() => {
    return safeSurahs.filter((s) => Boolean(map[s.id]));
  }, [safeSurahs, map]);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentSurahId, setCurrentSurahId] = React.useState<number | null>(
    list[0]?.id ?? null
  );
  const [isPlaying, setIsPlaying] = React.useState(false);

  const current = currentSurahId
    ? list.find((s) => s.id === currentSurahId) ?? null
    : null;

  function playSurah(surahId: number) {
    const url = map[surahId];
    if (!url) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (currentSurahId !== surahId) {
      audio.src = url;
      setCurrentSurahId(surahId);
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }

  function pause() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }

  function toggle(surahId: number) {
    if (currentSurahId === surahId && isPlaying) pause();
    else playSurah(surahId);
  }

  function next() {
    if (!currentSurahId || list.length === 0) return;
    const idx = list.findIndex((s) => s.id === currentSurahId);
    const nextId = list[Math.min(idx + 1, list.length - 1)]?.id;
    if (nextId) playSurah(nextId);
  }

  function prev() {
    if (!currentSurahId || list.length === 0) return;
    const idx = list.findIndex((s) => s.id === currentSurahId);
    const prevId = list[Math.max(idx - 1, 0)]?.id;
    if (prevId) playSurah(prevId);
  }

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      setIsPlaying(false);
      next();
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSurahId, list]);

  if (list.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-zinc-700">
          No recitations uploaded yet for this reciter.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Now playing */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="text-xs font-semibold text-zinc-500">Now playing</p>
        <p className="mt-1 font-semibold text-zinc-900">
          {current ? `${current.id}. ${current.name_en}` : "—"}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={prev}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition"
          >
            Prev
          </button>

          <button
            onClick={() => (currentSurahId ? toggle(currentSurahId) : null)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            {currentSurahId && isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={next}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition"
          >
            Next
          </button>
        </div>

        <audio ref={audioRef} className="mt-3 w-full" controls />
      </div>

      {/* List */}
      <div className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 overflow-hidden">
        {list.map((s) => {
          const active = currentSurahId === s.id;

          return (
            <div
              key={s.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900">
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
                    {s.id}
                  </span>
                  {s.name_en}
                  {s.name_ar ? (
                    <span className="ml-2 text-zinc-500 font-normal">
                      • {s.name_ar}
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(s.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition border
                    ${
                      active && isPlaying
                        ? "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
                        : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                    }`}
                >
                  {active && isPlaying ? "Pause" : "Play"}
                </button>

                <a
                  href={map[s.id]}
                  download
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition"
                >
                  Download
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
