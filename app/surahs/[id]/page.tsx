import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import SurahClient from "./SurahClient";

import type { Metadata } from "next";

type Surah = {
  id: number;
  name_en: string;
  name_ar: string | null;
};

type Reciter = {
  id: number;
  name: string;
  country: string;
  region: string;
};

// ✅ IMPORTANT: singular join field "reciter" (NOT "reciters")
type AvailableRow = {
  reciter_id: number;
  audio_path: string | null;
  reciter: Reciter | null; // ✅ single object
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const surahId = Number(params.id);

  const { data } = await supabase
    .from("surahs")
    .select("id, name_en, name_ar")
    .eq("id", surahId)
    .single();

  const name = data?.name_en ?? `Surah ${surahId}`;

  return {
    title: `${name} | Qur’an Global`,
    description: `Listen to Surah ${surahId}: ${name} from available reciters.`,
    alternates: { canonical: `/surahs/${surahId}` },
    openGraph: {
      title: `${name} | Qur’an Global`,
      description: `Listen to Surah ${surahId}: ${name} from available reciters.`,
      url: `/surahs/${surahId}`,
      type: "website",
    },
  };
}

async function getSurah(surahId: number): Promise<Surah | null> {
  const { data, error } = await supabase
    .from("surahs")
    .select("id, name_en, name_ar")
    .eq("id", surahId)
    .single();

  if (error) return null;
  return data as Surah;
}

// ✅ Fetch all reciters that have this surah audio
async function getAvailableRecitersForSurah(
  surahId: number
): Promise<{ reciters: Reciter[]; defaultReciterId: string; defaultAudioPath: string | null }> {
  // ✅ IMPORTANT: alias reciter join as "reciter" (singular)
  const { data, error } = await supabase
    .from("reciter_surahs")
    .select("reciter_id, audio_path, reciter:reciters(id, name, country, region)")
    .eq("surah_id", surahId)
    .order("reciter_id", { ascending: true });

  if (error || !data) {
    return { reciters: [], defaultReciterId: "", defaultAudioPath: null };
  }

  // ✅ Now TS matches perfectly
  const rows = data as unknown as AvailableRow[];

  // Keep only rows that have reciter + audio_path
  const cleaned = rows.filter((r) => r.reciter && r.audio_path);

  const reciters = cleaned.map((r) => r.reciter!) as Reciter[];

  const defaultReciterId = cleaned[0]?.reciter_id ? String(cleaned[0].reciter_id) : "";
  const defaultAudioPath = cleaned[0]?.audio_path ?? null;

  return { reciters, defaultReciterId, defaultAudioPath };
}

export default async function SurahPage({
  params,
}: {
  params: { id: string };
}) {
  const surahId = Number(params.id);

  const surah = await getSurah(surahId);

  if (!surah) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">Surah not found</p>
            <p className="mt-2 text-zinc-700">
              We couldn’t find Surah ID: <span className="font-mono">{surahId}</span>
            </p>

            <Link
              href="/surahs"
              className="mt-6 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              ← Back to Surahs
            </Link>
          </div>
        </main>
      </>
    );
  }

  const { reciters, defaultReciterId, defaultAudioPath } =
    await getAvailableRecitersForSurah(surahId);

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        {/* Header */}
        <section className="mt-8 rounded-3xl bg-zinc-900 px-6 py-10 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-amber-500 blur-3xl" />
          </div>

          <div className="relative z-10">
            <p className="text-sm text-zinc-200">
              Surah {surah.id} {surah.name_ar ? `• ${surah.name_ar}` : ""}
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
              {surah.name_en}
            </h1>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/surahs"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition"
              >
                ← Back to Surahs
              </Link>
            </div>
          </div>
        </section>

        {/* Client */}
        <section className="mt-6">
          <SurahClient
            surahId={surah.id}
            surahNameEn={surah.name_en}
            reciters={reciters}
            initialReciterId={defaultReciterId}
            initialAudioPath={defaultAudioPath}
          />
        </section>
      </main>
    </>
  );
}
