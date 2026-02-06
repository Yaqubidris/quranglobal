"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

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

export default function UploadPage() {
  const router = useRouter();

  const [checking, setChecking] = React.useState(true);
  const [email, setEmail] = React.useState<string | null>(null);

  const [reciters, setReciters] = React.useState<Reciter[]>([]);
  const [surahs, setSurahs] = React.useState<Surah[]>([]);

  const [reciterId, setReciterId] = React.useState("");
  const [surahId, setSurahId] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  // 1) Require login
  React.useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setEmail(session.user.email ?? null);
      }

      // 2) Load reciters + surahs (public reads)
      const [r1, r2] = await Promise.all([
        supabase
          .from("reciters")
          .select("id, name, country, region")
          .order("created_at", { ascending: false }),
        supabase
          .from("surahs")
          .select("id, name_en, name_ar")
          .order("id", { ascending: true }),
      ]);

      if (mounted) {
        setReciters((r1.data ?? []) as Reciter[]);
        setSurahs((r2.data ?? []) as Surah[]);

        const defaultReciter = (r1.data ?? [])?.[0]?.id;
        if (defaultReciter) setReciterId(String(defaultReciter));

        const defaultSurah = (r2.data ?? [])?.[0]?.id;
        if (defaultSurah) setSurahId(String(defaultSurah));

        setChecking(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!reciterId || !surahId) {
      setMsg("Please select a reciter and a surah.");
      return;
    }
    if (!file) {
      setMsg("Please choose an MP3 file.");
      return;
    }

    setLoading(true);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setLoading(false);
      setMsg("Session expired. Please login again.");
      router.replace("/login");
      return;
    }

    const form = new FormData();
    form.append("reciterId", reciterId);
    form.append("surahId", surahId);
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const json = await res.json();

      if (!res.ok) {
        setMsg(`❌ Upload failed: ${json.error ?? "Unknown error"}`);
      } else {
        setMsg("✅ Uploaded and saved successfully!");
        setFile(null);
        // (optional) reset file input by refreshing route
        router.refresh();
      }
    } catch (err: any) {
      setMsg(`❌ Upload failed: ${err?.message ?? "Network error"}`);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            Loading...
          </div>
        </main>
      </>
    );
  }

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
              Upload Recitation
            </h1>
            <p className="mt-2 text-zinc-200">
              Logged in as <span className="font-semibold">{email ?? "Admin"}</span>
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-zinc-600">
                Select Reciter
              </label>
              <select
                value={reciterId}
                onChange={(e) => setReciterId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                {reciters.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.name} — {r.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600">
                Select Surah
              </label>
              <select
                value={surahId}
                onChange={(e) => setSurahId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                {surahs.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.id}. {s.name_en} {s.name_ar ? `— ${s.name_ar}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-zinc-600">
                MP3 File
              </label>
              <input
                type="file"
                accept="audio/mpeg,audio/mp3,.mp3"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Saved to: <b>quran-audio</b> bucket → <b>audio/{reciterId || "reciterId"}/{surahId ? String(surahId).padStart(3,"0") : "001"}.mp3</b>
              </p>
            </div>

            {msg ? (
              <div className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
                {msg}
              </div>
            ) : null}

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                disabled={loading}
                className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Upload MP3"}
              </button>

              <a
                href="/admin"
                className="rounded-2xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold hover:bg-zinc-50"
              >
                Back to Admin
              </a>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
