import Navbar from "../components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import RecitersClient from "./RecitersClient";


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reciters | Qur’an Global",
  description:
    "Explore Qur’anic reciters from Africa and underrepresented regions. View profiles, countries, and listen to available recitations.",
  alternates: {
    canonical: "/reciters",
  },
  openGraph: {
    title: "Reciters | Qur’an Global",
    description:
      "Explore Qur’anic reciters from Africa and underrepresented regions. View profiles and listen to available recitations.",
    url: "/reciters",
    siteName: "Qur’an Global",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reciters | Qur’an Global",
    description:
      "Explore Qur’anic reciters from Africa and underrepresented regions. View profiles and listen to available recitations.",
  },
};

type ReciterRow = {
  id: string | number;
  name: string;
  region: string;
  country: string;
  dialect: string | null;
  image_path: string | null;
  created_at: string;
};

async function getAllReciters(): Promise<ReciterRow[]> {
  const { data, error } = await supabase
    .from("reciters")
    .select("id, name, region, country, dialect, image_path, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Supabase error:", error.message);
    return [];
  }

  return (data ?? []) as ReciterRow[];
}

export default async function RecitersPage() {
  const reciters = await getAllReciters();

  const regions = Array.from(new Set(reciters.map((r) => r.region))).sort();
  const countries = Array.from(new Set(reciters.map((r) => r.country))).sort();
  const dialects = Array.from(
    new Set(reciters.map((r) => r.dialect).filter(Boolean) as string[])
  ).sort();

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-14">
        {/* Page header */}
        <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                All Reciters
              </h1>
              <p className="mt-1 text-zinc-600">
                Search and filter reciters, then open a profile to listen and download surahs.
              </p>
            </div>
          </div>
        </section>

        {/* Client-side UI */}
        <section className="mt-6">
          <RecitersClient
            reciters={reciters}
            regions={regions}
            countries={countries}
            dialects={dialects}
          />
        </section>
      </main>
    </>
  );
}
