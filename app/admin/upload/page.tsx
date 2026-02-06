import Navbar from "@/app/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import UploadClient from "./UploadClient";
import type { Metadata } from "next";
import type { Reciter, Surah, UploadRow } from "@/lib/types";

export const metadata: Metadata = {
  title: "Upload Recitation | Qur’an Global",
  robots: { index: false, follow: false },
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

async function getUploadHistory(): Promise<UploadRow[]> {
  // ✅ IMPORTANT: use aliases that match UploadRow shape (reciter + surah)
  const { data, error } = await supabase
    .from("reciter_surahs")
    .select(
      "id, created_at, reciter_id, surah_id, audio_path, reciter:reciters(name), surah:surahs(name_en, name_ar)"
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return [];
  return (data ?? []) as unknown as UploadRow[];
}

export default async function UploadPage() {
  const [reciters, surahs, history] = await Promise.all([
    getReciters(),
    getSurahs(),
    getUploadHistory(),
  ]);

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="mt-8 rounded-3xl bg-zinc-900 px-6 py-10 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-amber-500 blur-3xl" />
          </div>

          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Admin Upload
            </h1>
            <p className="mt-2 text-zinc-200 max-w-2xl">
              Upload MP3s to Supabase Storage and link them to Reciter + Surah.
            </p>
          </div>
        </section>

        <section className="mt-6">
          <UploadClient reciters={reciters} surahs={surahs} initialHistory={history} />
        </section>
      </main>
    </>
  );
}
