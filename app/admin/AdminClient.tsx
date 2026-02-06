"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UploadRow = {
  id: number;
  created_at: string;
  reciter_id: string | number;
  surah_id: number;
  audio_path: string;
  reciter?: { name: string } | null;
  surah?: { name_en: string; name_ar: string | null } | null;
};

export default function AdminClient() {
  const router = useRouter();

  const [checking, setChecking] = React.useState(true);
  const [email, setEmail] = React.useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = React.useState(false);

  const [uploads, setUploads] = React.useState<UploadRow[]>([]);
  const [loadingUploads, setLoadingUploads] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function check() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setEmail(session.user.email ?? null);
        setChecking(false);
      }
    }

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    try {
      setLogoutLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.replace("/login");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Logout failed");
    } finally {
      setLogoutLoading(false);
    }
  }

  async function loadUploads() {
    setLoadingUploads(true);

    const { data, error } = await supabase
      .from("reciter_surahs")
      .select(
        "id, created_at, reciter_id, surah_id, audio_path, reciter:reciters(name), surah:surahs(name_en, name_ar)"
      )
      .order("created_at", { ascending: false })
      .limit(15);

    if (!error) setUploads((data ?? []) as any);
    setLoadingUploads(false);
  }

  React.useEffect(() => {
    if (!checking) loadUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  if (checking) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            Checking session...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="rounded-3xl bg-zinc-900 px-6 py-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-amber-500 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Admin Dashboard
            </h1>

            <p className="text-zinc-200">
              Logged in as <span className="font-semibold">{email ?? "Admin"}</span>
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="/upload"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition"
              >
                Upload Recitation →
              </a>

              <a
                href="/admin/reciters"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition"
              >
                Add Reciter →
              </a>

              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {logoutLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Recent Uploads</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Latest recitations added to the database.
                </p>
              </div>

              <button
                onClick={loadUploads}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4">
              {loadingUploads ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-zinc-700">
                  Loading uploads...
                </div>
              ) : uploads.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-zinc-700">
                  No uploads yet.
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 overflow-hidden">
                  {uploads.map((u) => (
                    <div
                      key={u.id}
                      className="p-4 sm:p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">
                          {u.reciter?.name ?? `Reciter ${u.reciter_id}`} —{" "}
                          {u.surah ? `${u.surah_id}. ${u.surah.name_en}` : `Surah ${u.surah_id}`}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {new Date(u.created_at).toLocaleString()}
                        </p>
                      </div>

                      <a
                        href={u.audio_path}
                        target="_blank"
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition"
                      >
                        Open audio
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Tips</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li>• Bucket: <b>quran-audio</b></li>
              <li>• Save link in <b>reciter_surahs.audio_path</b></li>
              <li>• Surah id is 1..114</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
