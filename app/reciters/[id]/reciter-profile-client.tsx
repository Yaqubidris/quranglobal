"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SurahRow = {
  id: number;
  reciter_id: number;
  surah_number: number;
  name_english: string;
  audio_path: string | null;
  created_at: string;
};

/**
 * IMPORTANT:
 * - If you store audio in Supabase Storage, you’ll later generate a public URL here.
 * - For now, we’ll play ONLY if audio_path is present and already a valid URL or path you support.
 */
function getAudioUrl(audio_path: string | null) {
  if (!audio_path) return null;

  // If you already store full URLs in audio_path, this will work immediately.
  if (audio_path.startsWith("http")) return audio_path;

  // If later you store in Supabase storage, you can replace this with a real public URL function.
  // For now: keep as-is. Example audio_path: "/audio/001.mp3" if you host locally.
  return audio_path;
}

export default function ReciterProfileClient({
  reciterName,
  surahs,
}: {
  reciterName: string;
  surahs: SurahRow[];
}) {
  const playable = useMemo(
    () => surahs.filter((s) => !!getAudioUrl(s.audio_path)),
    [surahs]
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const current = currentIndex >= 0 ? playable[currentIndex] : null;
  const currentUrl = current ? getAudioUrl(current.audio_path) : null;

  function playAt(index: number) {
    if (index < 0 || index >= playable.length) return;
    setCurrentIndex(index);
    setIsPlaying(true);
  }

  function togglePlay(index: number) {
    if (index === currentIndex) {
      // toggle
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } else {
      playAt(index);
    }
  }

  function playNext() {
    if (playable.length === 0) return;
    const next = currentIndex + 1;
    if (next < playable.length) playAt(next);
    else {
      // reached end
      setIsPlaying(false);
    }
  }

  function playPrev() {
    if (playable.length === 0) return;
    const prev = currentIndex - 1;
    if (prev >= 0) playAt(prev);
  }

  // When current track changes, load and play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentUrl) return;

    audio.src = currentUrl;

    if (isPlaying) {
      audio.play().catch(() => {
        // browser autoplay restrictions can block; user can tap play
        setIsPlaying(false);
      });
    }
  }, [currentUrl]);

  // Keep isPlaying in sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => playNext();

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIndex]);

  return (
    <div className="relative">
      {/* Surah list */}
      {surahs.length === 0 ? (
        <div className="p-6 text-zinc-600">No surahs yet for this reciter.</div>
      ) : (
        <div className="divide-y divide-zinc-200">
          {surahs.map((s) => {
            const url = getAudioUrl(s.audio_path);
            const playableIndex = playable.findIndex((p) => p.id === s.id);
            const isCurrent = playableIndex === currentIndex;

            return (
              <div
                key={s.id}
                className="flex items-center gap-3 px-4 py-4 sm:px-6"
              >
                <div className="w-10 text-sm font-semibold text-zinc-700">
                  {String(s.surah_number).padStart(3, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900">
                    {s.name_english}
                  </p>
                  <p className="text-xs text-zinc-500">{reciterName}</p>
                </div>

                {/* Play button */}
                <button
                  onClick={() => {
                    if (url && playableIndex !== -1) togglePlay(playableIndex);
                    else alert("No audio yet for this surah.");
                  }}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    isCurrent && isPlaying
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "border border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {isCurrent && isPlaying ? "Pause" : "Play"}
                </button>

                {/* Download */}
                <a
                  href={url ?? "#"}
                  onClick={(e) => {
                    if (!url) {
                      e.preventDefault();
                      alert("No audio yet to download.");
                    }
                  }}
                  className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                  download
                >
                  Download
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Playlist player (NOT persistent — only on this page) */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs text-zinc-500">Now playing</p>
              <p className="truncate text-sm font-semibold text-zinc-900">
                {current ? `${current.name_english} • ${reciterName}` : "Nothing selected"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={playPrev}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Prev
              </button>

              <button
                onClick={() => {
                  const audio = audioRef.current;
                  if (!audio) return;

                  if (!currentUrl) {
                    if (playable.length > 0) playAt(0);
                    else alert("No audio tracks available yet.");
                    return;
                  }

                  if (audio.paused) audio.play();
                  else audio.pause();
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>

              <button
                onClick={playNext}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Next
              </button>
            </div>
          </div>

          <audio ref={audioRef} className="mt-3 w-full" controls />
        </div>
      </div>
    </div>
  );
}
