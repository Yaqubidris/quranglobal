import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://quran-global.vercel.app"; // change later

  // Static pages
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/reciters`, lastModified: new Date() },
    { url: `${base}/recitations`, lastModified: new Date() },
    { url: `${base}/surahs`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
  ];

  // Dynamic: Surahs
  const { data: surahs } = await supabase
    .from("surahs")
    .select("id")
    .order("id", { ascending: true });

  for (const s of surahs ?? []) {
    routes.push({
      url: `${base}/surahs/${s.id}`,
      lastModified: new Date(),
    });
  }

  // Dynamic: Reciters
  const { data: reciters } = await supabase
    .from("reciters")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  for (const r of reciters ?? []) {
    routes.push({
      url: `${base}/reciters/${r.id}`,
      lastModified: r.created_at ? new Date(r.created_at) : new Date(),
    });
  }

  return routes;
}
