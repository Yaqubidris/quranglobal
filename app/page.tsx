import Navbar from "./components/Navbar";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Reciter } from "@/lib/types";

async function getFeaturedReciters(): Promise<Reciter[]> {
  const { data, error } = await supabase
    .from("reciters")
    .select("id, name, region, country, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Supabase error:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function Home() {
  const reciters = await getFeaturedReciters();

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        {/* Hero */}
        <section className="relative mt-8 overflow-hidden rounded-3xl bg-zinc-900 px-6 py-16 text-white sm:px-10">
          {/* Soft background */}
          <div className="pointer-events-none absolute inset-0 opacity-35">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-amber-500 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.08)_1px,transparent_0)] [background-size:22px_22px]" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-100">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Preserving underrepresented reciters
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Preserving the Voices of Qur’anic Reciters
            </h1>

            <p className="text-lg leading-relaxed text-zinc-200">
              Discover, listen to, and download beautiful Qur’an recitations from
              African and underrepresented reciters — in one clean library.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/reciters"
                className="rounded-xl bg-emerald-400 px-6 py-3 text-center font-semibold text-zinc-900 hover:bg-emerald-300 transition"
              >
                Explore Reciters
              </Link>

              <Link
                href="/recitations"
                className="rounded-xl border border-white/20 px-6 py-3 text-center font-semibold text-white hover:bg-white/10 transition"
              >
                Browse Recitations
              </Link>
            </div>

            <div className="pt-2 text-sm text-zinc-300">
              Built with Next.js + Supabase • Mobile-friendly • Fast
            </div>
          </div>
        </section>

        {/* Quick value props */}
        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Curated Voices</p>
            <p className="mt-1 text-sm text-zinc-600">
              Spotlighting reciters that deserve to be heard globally.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Easy Listening</p>
            <p className="mt-1 text-sm text-zinc-600">
              Play surahs instantly with a clean per-page player.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Download Ready</p>
            <p className="mt-1 text-sm text-zinc-600">
              Download recitations surah-by-surah when available.
            </p>
          </div>
        </section>

        {/* Featured Reciters */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Featured Reciters</h2>
              <p className="mt-1 text-zinc-600">
                Start listening to some amazing voices.
              </p>
            </div>

            <Link
              href="/reciters"
              className="hidden rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition sm:inline-flex"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reciters.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600">
                No reciters yet. Add some in Supabase.
              </div>
            ) : (
              reciters.map((r) => {
                const initial = (r.name?.trim()?.[0] ?? "?").toUpperCase();

                return (
                  <div
                    key={String(r.id)}
                    className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4">
                      {/* Modern avatar */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-zinc-900">
                          {r.name}
                        </p>
                        <p className="mt-0.5 text-sm text-zinc-600">
                          {r.country} • {r.region}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/recitations?reciter=${String(r.id)}`}
                        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        Listen
                      </Link>

                      <Link
                        href={`/reciters/${String(r.id)}`}
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-center text-sm font-semibold hover:bg-zinc-50 transition"
                      >
                        Profile
                      </Link>
                    </div>

                    <div className="mt-4 h-px w-full bg-zinc-100" />
                    <p className="mt-3 text-xs text-zinc-500">
                      Tip: Add more reciters to see this grid grow.
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 sm:hidden">
            <Link
              href="/reciters"
              className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-zinc-50 transition"
            >
              View all reciters
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t border-zinc-200 py-10 text-sm text-zinc-600">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Qur’an Global. All rights reserved.</p>
            <div className="flex gap-4">
              <Link className="hover:text-zinc-900" href="/reciters">
                Reciters
              </Link>
              <Link className="hover:text-zinc-900" href="/recitations">
                Recitations
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
