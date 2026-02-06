import Navbar from "@/app/components/Navbar";
import RecentlyPlayedClient from "./RecentlyplayedClient";

export default function RecentlyPlayedPage() {
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
              Recently Played
            </h1>
            <p className="mt-2 text-zinc-200">
              Your listening history (saved on this device).
            </p>
          </div>
        </section>

        <section className="mt-6">
          <RecentlyPlayedClient />
        </section>
      </main>
    </>
  );
}
