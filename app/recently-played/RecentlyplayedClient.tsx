"use client";

import React from "react";
import Link from "next/link";
import {
  clearRecentlyPlayed,
  getRecentlyPlayed,
  timeAgo,
  type RecentlyPlayedItem,
} from "@/lib/recentlyPlayed";

export default function RecentlyPlayedClient() {
  const [items, setItems] = React.useState<RecentlyPlayedItem[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItems(getRecentlyPlayed());
  }, []);

  function handleClear() {
    clearRecentlyPlayed();
    setItems([]);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrent(null);
  }

  function play(item: RecentlyPlayedItem) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = item.audioPath;
    setCurrent(`${item.reciterId}-${item.surahId}`);
    audio.play().catch(() => {});
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 bg-gradient-to-b from-white to-zinc-50 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">History</h2>
          <p className="text-sm text-zinc-600">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/recitations"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition"
          >
            Go to Recitations
          </Link>

          <button
            onClick={handleClear}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-zinc-700">
            Nothing played yet. Go to Recitations or Surahs and press Play.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 overflow-hidden">
            {items.map((x) => {
              const active = current === `${x.reciterId}-${x.surahId}`;
              return (
                <div
                  key={`${x.reciterId}-${x.surahId}-${x.playedAt}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">
                      {x.surahId}. {x.surahNameEn}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 truncate">
                      {x.reciterName} • {timeAgo(x.playedAt)}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/surahs/${x.surahId}`}
                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Open Surah →
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => play(x)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold border transition ${
                        active
                          ? "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
                          : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {active ? "Playing" : "Play"}
                    </button>

                    <a
                      href={x.audioPath}
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
        )}

        <audio ref={audioRef} className="mt-4 w-full" controls />
      </div>
    </div>
  );
}
