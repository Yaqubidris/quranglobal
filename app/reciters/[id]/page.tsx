import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ReciterSurahPlayer from "./ReciterSurahPlayer";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const reciterId = String(id);

  const { data } = await supabase
    .from("reciters")
    .select("id, name, country, region")
    .eq("id", reciterId)
    .single();

  const name = data?.name ?? "Reciter";

  return {
    title: name,
    description: `Listen to Qur’an recitations by ${name} (${data?.country ?? ""}).`,
    alternates: { canonical: `/reciters/${reciterId}` },
    openGraph: {
      title: `${name} — Qur’an Reciter`,
      description: `Listen to Qur’an recitations by ${name}.`,
      url: `/reciters/${reciterId}`,
      images: ["/og.png"],
    },
  };
}

type Reciter = {
  id: string | number;
  name: string;
  country: string;
  region: string;
  dialect: string | null;
  bio: string | null;
};

type Surah = {
  id: number;
  name_en: string;
  name_ar: string | null;
};

type ReciterSurahRow = {
  surah_id: number;
  audio_path: string; // your DB column name
  created_at: string | null;
};

async function getReciter(reciterId: string) {
  const { data, error } = await supabase
    .from("reciters")
    .select("id, name, country, region, dialect, bio")
    .eq("id", reciterId)
    .single();

  if (error) return null;
  return data as Reciter;
}

async function getAllSurahs(): Promise<Surah[]> {
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
    .select("surah_id, audio_path, created_at")
    .eq("reciter_id", reciterId)
    .order("surah_id", { ascending: true });

  if (error) return [];
  return (data ?? []) as ReciterSurahRow[];
}

function resolveAudioUrl(audio_path: string) {
  if (!audio_path) return "";
  if (audio_path.startsWith("http://") || audio_path.startsWith("https://")) return audio_path;
  return audio_path;
}

export default async function ReciterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reciterId = String(id);

  const reciter = await getReciter(reciterId);

  if (!reciter) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">Reciter not found</p>
            <p className="mt-2 text-zinc-700">
              We couldn’t find a reciter with id:{" "}
              <span className="font-mono">{reciterId}</span>
            </p>
            <Link
              href="/reciters"
              className="mt-6 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              ← Back to Reciters
            </Link>
          </div>
        </main>
      </>
    );
  }

  const [surahs, reciterSurahs] = await Promise.all([
    getAllSurahs(),
    getReciterSurahs(reciterId),
  ]);

  const audioMap = new Map<number, string>();
  let latestUpload: string | null = null;

  for (const row of reciterSurahs) {
    audioMap.set(row.surah_id, resolveAudioUrl(row.audio_path));
    if (row.created_at) {
      if (!latestUpload || new Date(row.created_at) > new Date(latestUpload)) {
        latestUpload = row.created_at;
      }
    }
  }

  const availableCount = reciterSurahs.length;
  const totalSurahs = 114;

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        {/* HERO */}
        <section className="relative mt-8 overflow-hidden rounded-3xl bg-zinc-900 px-6 py-12 text-white">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-amber-500 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-200/80">Reciter Profile</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                  {reciter.name}
                </h1>
                <p className="mt-2 text-zinc-200">
                  {reciter.country} • {reciter.region}
                  {reciter.dialect ? <span> • {reciter.dialect}</span> : null}
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/recitations"
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition"
                >
                  Browse Recitations →
                </Link>

                <Link
                  href="/reciters"
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
                >
                  ← Back
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs font-semibold text-zinc-200/80">Available Surahs</p>
                <p className="mt-2 text-2xl font-bold">{availableCount}</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs font-semibold text-zinc-200/80">Total Surahs</p>
                <p className="mt-2 text-2xl font-bold">{totalSurahs}</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs font-semibold text-zinc-200/80">Last Upload</p>
                <p className="mt-2 text-sm font-semibold">
                  {latestUpload ? new Date(latestUpload).toDateString() : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight">About</h2>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {reciter.bio?.trim()
                  ? reciter.bio
                  : "No bio yet. You can add a bio in Supabase (reciters table)."}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/recitations"
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 text-center"
                >
                  Listen to Recitations
                </Link>
                <Link
                  href="/reciters"
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold hover:bg-zinc-50 text-center"
                >
                  Explore Other Reciters
                </Link>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-b from-white to-zinc-50 border-b border-zinc-200">
                <h2 className="text-lg font-semibold tracking-tight">Available Recitations</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Surahs with audio for this reciter.
                </p>
              </div>

              <ReciterSurahPlayer
                surahs={surahs}
                audioMap={Object.fromEntries(audioMap.entries())}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
