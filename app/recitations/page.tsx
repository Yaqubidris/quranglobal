import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import RecitationsClient from "./RecitationsClient";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recitations | Qur’an Global",
  description:
    "Browse Surahs and listen to Qur’an recitations by selected reciters. Play and download recitations surah-by-surah.",
  alternates: {
    canonical: "/recitations",
  },
  openGraph: {
    title: "Recitations | Qur’an Global",
    description:
      "Browse Surahs and listen to Qur’an recitations by selected reciters. Play and download recitations surah-by-surah.",
    url: "/recitations",
    siteName: "Qur’an Global",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recitations | Qur’an Global",
    description:
      "Browse Surahs and listen to Qur’an recitations by selected reciters. Play and download recitations surah-by-surah.",
  },
};

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
  audio_path: string | null; // IMPORTANT: your column is audio_path (not audio_url)
};

async function getReciters(): Promise<Reciter[]> {
  const { data, error } = await supabase
    .from("reciters")
    .select("id, name, country, region")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Reciter[];
}

async function getSurahs(): Promise<Surah[]> {
  const { data, error } = await supabase
    .from("surahs")
    .select("id, name_en, name_ar")
    .order("id", { ascending: true });

  if (error) return [];
  return (data ?? []) as Surah[];
}

async function getReciterSurahs(reciterId: string): Promise<ReciterSurahRow[]> {
  const { data, error } = await supabase
    .from("reciter_surahs")
    .select("surah_id, audio_path")
    .eq("reciter_id", reciterId);

  if (error) return [];
  return (data ?? []) as ReciterSurahRow[];
}

// ✅ Next.js 16 expects searchParams to be a Promise in generated types
export default async function RecitationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ reciter?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const reciterFromUrl = (sp.reciter ?? "").trim(); // ✅ normalize

  const reciters = await getReciters();
  const surahs = await getSurahs();

  // ✅ decide which reciter to use:
  // 1) ?reciter=... from URL IF it exists
  // 2) otherwise first reciter
  const exists =
    reciterFromUrl !== "" &&
    reciters.some((r) => String(r.id) === String(reciterFromUrl));

  const defaultReciterId = exists
    ? String(reciterFromUrl)
    : reciters?.[0]?.id
    ? String(reciters[0].id)
    : "";

  const reciterSurahs = defaultReciterId
    ? await getReciterSurahs(defaultReciterId)
    : [];

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

          <div className="relative z-10 flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Browse Recitations
            </h1>
            <p className="text-zinc-200 max-w-2xl">
              Select a reciter, search Surahs, then play or download recitations
              surah-by-surah.
            </p>

            <div className="mt-4 flex gap-3 flex-wrap">
              <Link
                href="/reciters"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition"
              >
                Explore Reciters →
              </Link>
            </div>
          </div>
        </section>

        {/* Client UI */}
        <section className="mt-6">
          <RecitationsClient
            reciters={reciters}
            surahs={surahs}
            initialReciterId={defaultReciterId}
            initialReciterSurahs={reciterSurahs}
          />
        </section>
      </main>
    </>
  );
}
