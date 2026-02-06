import Navbar from "@/app/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import SurahsClient from "./SurahsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Surahs",
  description: "Browse all 114 Surahs and see which ones have available recitations.",
  alternates: { canonical: "/surahs" },
};

type Surah = {
  id: number;
  name_en: string;
  name_ar: string | null;
};

type ReciterSurah = {
  surah_id: number;
  reciter_id: number;
};

async function getSurahs(): Promise<Surah[]> {
  const { data, error } = await supabase
    .from("surahs")
    .select("id, name_en, name_ar")
    .order("id", { ascending: true });

  if (error) return [];
  return (data ?? []) as Surah[];
}

async function getAvailabilityMap(): Promise<Record<number, number>> {
  // Pull minimal data and compute counts in code
  const { data, error } = await supabase
    .from("reciter_surahs")
    .select("surah_id, reciter_id");

  if (error || !data) return {};

  const rows = data as ReciterSurah[];

  // surah_id -> Set(reciter_id) so we count unique reciters per surah
  const map = new Map<number, Set<number>>();

  for (const row of rows) {
    if (!map.has(row.surah_id)) map.set(row.surah_id, new Set());
    map.get(row.surah_id)!.add(row.reciter_id);
  }

  const result: Record<number, number> = {};
  for (const [surahId, set] of map.entries()) {
    result[surahId] = set.size;
  }

  return result;
}

export default async function SurahsPage() {
  const surahs = await getSurahs();
  const availability = await getAvailabilityMap();

  const total = surahs.length;
  const withAudio = surahs.filter((s) => (availability[s.id] ?? 0) > 0).length;

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        {/* Header */}
        <section className="mt-8 rounded-3xl bg-zinc-900 px-6 py-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-amber-500 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Surahs
            </h1>

            <p className="text-zinc-200 max-w-2xl">
              Search the Qur’an Surahs and see how many reciters have recitations available for each one.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm">
                Total Surahs: <span className="font-semibold">{total}</span>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm">
                With Audio: <span className="font-semibold">{withAudio}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Client UI */}
        <section className="mt-6">
          <SurahsClient surahs={surahs} availability={availability} />
        </section>
      </main>
    </>
  );
}
