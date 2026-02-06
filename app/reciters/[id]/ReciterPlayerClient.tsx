"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Track = {
  surahId: number;
  titleEn: string;
  titleAr: string | null;
  audioPath: string; // FULL URL already (since yours works)
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function ReciterPlayerClient({
  reciterName,
  playlist,
}: {
  reciterName: string;
  playlist: Track[];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [pos, setPos] = useState(0);

  const current = playlist[currentIndex];

  const currentUrl = useMemo(() => {
    if (!current) return "";
    return current.audioPath; // ✅ direct URL
  }, [current]);

  // Load track when changed
  useEffect(() => {
    setPos(0);
    setDuration(0);
    setIsPlaying(false);

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    if (currentUrl) {
      audio.src = currentUrl;
      audio.load();
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [currentUrl]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => setPos(audio.currentTime || 0);
    const onEnd = () => {
      if (currentIndex < playlist.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, [currentIndex, playlist.length]);

  function play() {
    const audio = audioRef.current;
    if (!audio) return;
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

  function toggle() {
    if (!isReady) return;
    if (isPlaying) pause();
    else play();
  }

  function prev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function next() {
    if (currentIndex < playlist.length - 1) setCurrentIndex((i) => i + 1);
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setPos(value);
  }

  if (playlist.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600">
        No surahs found for this reciter yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* PLAYER */}
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-24 rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {/* fancy header */}
          <div className="relative px-5 pt-5 pb-4 bg-zinc-900 text-white">
            <div className="absolute inset-0 opacity-25">
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-500 blur-3xl" />
            </div>

            <div className="relative z-10">
              <p className="text-xs font-medium text-white/70">Now Playing</p>

              <h2 className="mt-1 text-xl font-bold tracking-tight">
                {current?.titleEn ?? "—"}
              </h2>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                  Reciter: {reciterName}
                </span>
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                  Track {currentIndex + 1}/{playlist.length}
                </span>
              </div>

              {current?.titleAr ? (
                <p className="mt-3 text-base text-white/90">{current.titleAr}</p>
              ) : null}
            </div>
          </div>

          {/* controls */}
          <div className="p-5">
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-zinc-50"
              >
                ◀
              </button>

              <button
                onClick={toggle}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>

              <button
                onClick={next}
                disabled={currentIndex === playlist.length - 1}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-zinc-50"
              >
                ▶
              </button>
            </div>

            {/* seek */}
            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={Math.max(1, duration)}
                value={Math.min(pos, duration || 0)}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>{formatTime(pos)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* download current */}
            <div className="mt-4">
              <button
                onClick={() => {
                  const filename = `${String(current.surahId).padStart(3, "0")} - ${current.titleEn} - ${reciterName}.mp3`;
                  downloadFile(currentUrl, filename);
                }}
                className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition"
              >
                Download current surah
              </button>
            </div>

            <audio ref={audioRef} preload="metadata" />
          </div>
        </div>
      </div>

      {/* PLAYLIST */}
      <div className="lg:col-span-3">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Surah List</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Tap to play • Download any surah instantly
              </p>
            </div>

            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setTimeout(play, 50);
                }}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Play all
              </button>
              <button
                onClick={() => {
                  const random = Math.floor(Math.random() * playlist.length);
                  setCurrentIndex(random);
                  setTimeout(play, 50);
                }}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
              >
                Shuffle
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {playlist.map((t, idx) => {
              const active = idx === currentIndex;

              return (
                <div
                  key={t.surahId}
                  className={[
                    "rounded-2xl border p-4 transition",
                    active
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-zinc-200 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => {
                        setCurrentIndex(idx);
                        setTimeout(play, 50);
                      }}
                      className="min-w-0 text-left flex-1"
                    >
                      <p className="text-sm font-bold text-zinc-900">
                        {String(t.surahId).padStart(3, "0")} • {t.titleEn}
                      </p>
                      {t.titleAr ? (
                        <p className="mt-1 text-sm text-zinc-700">{t.titleAr}</p>
                      ) : (
                        <p className="mt-1 text-xs text-zinc-500">{reciterName}</p>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          active
                            ? isPlaying
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-200 text-emerald-900"
                            : "bg-zinc-100 text-zinc-700",
                        ].join(" ")}
                      >
                        {active ? (isPlaying ? "Playing" : "Selected") : "Tap"}
                      </span>

                      <button
                        onClick={() => {
                          const filename = `${String(t.surahId).padStart(3, "0")} - ${t.titleEn} - ${reciterName}.mp3`;
                          downloadFile(t.audioPath, filename);
                        }}
                        className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold hover:bg-white"
                        title="Download"
                      >
                        ⬇
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* mobile quick actions */}
          <div className="mt-4 flex sm:hidden gap-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setTimeout(play, 50);
              }}
              className="flex-1 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Play all
            </button>
            <button
              onClick={() => {
                const random = Math.floor(Math.random() * playlist.length);
                setCurrentIndex(random);
                setTimeout(play, 50);
              }}
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold"
            >
              Shuffle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
