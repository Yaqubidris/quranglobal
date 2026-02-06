"use client";

import React from "react";
import Link from "next/link";

type Surah = {
  id: number;
  name_en: string;
  name_ar: string | null;
};

function safeLower(s: string | null | undefined) {
  return (s ?? "").toLowerCase();
}

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

export default function SurahsClient({
  surahs,
  availability,
}: {
  surahs: Surah[];
  availability: Record<number, number>;
}) {
  const safeSurahs = Array.isArray(surahs) ? surahs : [];

  const [q, setQ] = React.useState("");
  const [onlyWithAudio, setOnlyWithAudio] = React.useState(false);
  const [view, setView] = React.useState<"grid" | "list">("grid"); // ✅ NEW

  const list = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    return safeSurahs.filter((s) => {
      const count = availability[s.id] ?? 0;

      const matchesSearch =
        query === "" ||
        String(s.id).includes(query) ||
        safeLower(s.name_en).includes(query) ||
        safeLower(s.name_ar).includes(query);

      const matchesAudio = !onlyWithAudio || count > 0;

      return matchesSearch && matchesAudio;
    });
  }, [q, onlyWithAudio, safeSurahs, availability]);

  const withAudioCount = React.useMemo(() => {
    return safeSurahs.filter((s) => (availability[s.id] ?? 0) > 0).length;
  }, [safeSurahs, availability]);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-5 sm:p-6 bg-gradient-to-b from-white to-zinc-50">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {/* Search */}
            <div className="w-full lg:max-w-lg">
              <label className="text-xs font-semibold text-zinc-500">Search</label>
              <div className="mt-2 relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by number, English or Arabic name (e.g. 1, Fatiha, الفاتحة)"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-sm outline-none
                             focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-9 w-9 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-500 text-sm">
                    ⌕
                  </div>
                </div>
              </div>
            </div>

            {/* Filters + stats */}
            <div className="flex flex-wrap items-center gap-3">
              {/* ✅ Grid/List toggle */}
              <div className="inline-flex rounded-2xl border border-zinc-200 bg-white p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    view === "grid"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    view === "list"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  List
                </button>
              </div>

              <label className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={onlyWithAudio}
                  onChange={(e) => setOnlyWithAudio(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Only with audio
              </label>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">
                Showing {list.length} / {safeSurahs.length}
              </div>

              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700">
                With audio: {withAudioCount}
              </div>
            </div>
          </div>

          {/* Tiny helper line */}
          <p className="text-xs text-zinc-500">
            Tip: Search supports surah number, English name, and Arabic name.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-zinc-700">
            No surahs matched your search/filters.
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => {
              const count = availability[s.id] ?? 0;
              const hasAudio = count > 0;

              return (
                <Link
                  key={s.id}
                  href={`/surahs/${s.id}`}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl opacity-0 group-hover:opacity-100 transition" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl opacity-0 group-hover:opacity-100 transition" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white text-sm font-bold">
                          {s.id}
                        </span>

                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-semibold text-zinc-500">
                            Surah {pad3(s.id)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-2 text-xs font-semibold ${
                              hasAudio ? "text-emerald-700" : "text-zinc-500"
                            }`}
                          >
                            <span
                              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                                hasAudio ? "bg-emerald-500" : "bg-zinc-300"
                              }`}
                            />
                            {hasAudio ? "Audio available" : "No audio yet"}
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 font-semibold text-zinc-900 truncate text-lg">
                        {s.name_en}
                      </p>

                      <p
                        className="mt-1 text-2xl font-semibold text-zinc-900/90 truncate"
                        dir="rtl"
                      >
                        {s.name_ar ?? "—"}
                      </p>
                    </div>

                    <div
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold border ${
                        hasAudio
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                      title="Number of reciters with audio"
                    >
                      {count} reciter{count === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="relative mt-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
                      Open Surah <span className="transition group-hover:translate-x-0.5">→</span>
                    </span>

                    <span className="text-xs text-zinc-500">
                      {hasAudio ? "Listen now" : "Upload needed"}
                    </span>
                  </div>

                  <div className="relative mt-4 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                  <div className="relative mt-4 flex gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                        hasAudio
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-zinc-50 text-zinc-600 border-zinc-200"
                      }`}
                    >
                      {hasAudio ? "Ready" : "Needs upload"}
                    </span>

                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border bg-white text-zinc-700 border-zinc-200">
                      Tap to open
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ✅ LIST VIEW (same functionality, different look) */
          <div className="divide-y divide-zinc-200 rounded-3xl border border-zinc-200 overflow-hidden">
            {list.map((s) => {
              const count = availability[s.id] ?? 0;
              const hasAudio = count > 0;

              return (
                <Link
                  key={s.id}
                  href={`/surahs/${s.id}`}
                  className="group flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 hover:bg-zinc-50 transition"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="shrink-0">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold">
                        {s.id}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-900 truncate">
                          {s.name_en}
                        </p>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${
                            hasAudio
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : "bg-zinc-50 border-zinc-200 text-zinc-600"
                          }`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              hasAudio ? "bg-emerald-500" : "bg-zinc-300"
                            }`}
                          />
                          {hasAudio ? "Audio available" : "No audio yet"}
                        </span>

                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border bg-white text-zinc-700 border-zinc-200">
                          Surah {pad3(s.id)}
                        </span>
                      </div>

                      <p className="mt-1 text-xl font-semibold text-zinc-900/90 truncate" dir="rtl">
                        {s.name_ar ?? "—"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {hasAudio ? "Listen now" : "Upload needed"} • {count} reciter
                        {count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
                      Open Surah →
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                        hasAudio
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                      title="Number of reciters with audio"
                    >
                      {count}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
