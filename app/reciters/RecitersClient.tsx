"use client";

import React from "react";
import Link from "next/link";

type ReciterRow = {
  id: string | number;
  name: string;
  region: string;
  country: string;
  dialect: string | null;
  image_path: string | null;
  created_at: string;
};

type SortMode = "newest" | "az" | "country";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0]?.toUpperCase() ?? "";
  const second = parts[1]?.[0]?.toUpperCase() ?? "";
  return (first + second) || "QG";
}

function formatDateShort(iso: string) {
  // simple & safe (no intl headaches)
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch {
    return "";
  }
}

export default function RecitersClient({
  reciters,
  regions,
  countries,
  dialects,
}: {
  reciters: ReciterRow[];
  regions: string[];
  countries: string[];
  dialects: string[];
}) {
  const [q, setQ] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [dialect, setDialect] = React.useState("");
  const [sort, setSort] = React.useState<SortMode>("newest");
  const [view, setView] = React.useState<"grid" | "list">("grid");

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = reciters.filter((r) => {
      const matchesSearch =
        query === "" ||
        r.name.toLowerCase().includes(query) ||
        r.country.toLowerCase().includes(query) ||
        r.region.toLowerCase().includes(query) ||
        (r.dialect ?? "").toLowerCase().includes(query);

      const matchesRegion = region === "" || r.region === region;
      const matchesCountry = country === "" || r.country === country;
      const matchesDialect = dialect === "" || r.dialect === dialect;

      return matchesSearch && matchesRegion && matchesCountry && matchesDialect;
    });

    // Sorting
    const sorted = [...base];
    if (sort === "newest") {
      sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === "az") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "country") {
      sorted.sort((a, b) => a.country.localeCompare(b.country));
    }

    return sorted;
  }, [q, region, country, dialect, sort, reciters]);

  const hasFilters = q || region || country || dialect || sort !== "newest";

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Top toolbar */}
      <div className="p-5 sm:p-6 bg-gradient-to-b from-white to-zinc-50">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                🔎
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search reciters by name, country, region..."
                className="w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Results pill + view buttons */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 border border-emerald-100">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </span>

              <button
                onClick={() => setView("grid")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold border transition
                  ${view === "grid"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                  }`}
                title="Grid view"
              >
                ⬛⬛
              </button>

              <button
                onClick={() => setView("list")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold border transition
                  ${view === "list"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                  }`}
                title="List view"
              >
                ☰
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                         focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">All regions</option>
              {regions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                         focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">All countries</option>
              {countries.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                         focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">All dialects</option>
              {dialects.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                         focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="newest">Sort: Newest</option>
              <option value="az">Sort: A–Z</option>
              <option value="country">Sort: Country</option>
            </select>

            <button
              onClick={() => {
                setQ("");
                setRegion("");
                setCountry("");
                setDialect("");
                setSort("newest");
              }}
              disabled={!hasFilters}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold border transition
                ${hasFilters
                  ? "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50"
                  : "bg-zinc-50 text-zinc-400 border-zinc-100 cursor-not-allowed"
                }`}
            >
              Reset
            </button>
          </div>

          {/* Active filters chips */}
          {hasFilters ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {q ? (
                <span className="rounded-full bg-zinc-900 text-white px-3 py-1 text-xs font-semibold">
                  Search: {q}
                </span>
              ) : null}
              {region ? (
                <span className="rounded-full bg-zinc-100 text-zinc-800 px-3 py-1 text-xs font-semibold">
                  Region: {region}
                </span>
              ) : null}
              {country ? (
                <span className="rounded-full bg-zinc-100 text-zinc-800 px-3 py-1 text-xs font-semibold">
                  Country: {country}
                </span>
              ) : null}
              {dialect ? (
                <span className="rounded-full bg-zinc-100 text-zinc-800 px-3 py-1 text-xs font-semibold">
                  Dialect: {dialect}
                </span>
              ) : null}
              {sort !== "newest" ? (
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-semibold">
                  {sort === "az" ? "Sorted: A–Z" : "Sorted: Country"}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-zinc-700">
            No reciters matched your search/filters.
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <Link
                key={String(r.id)}
                href={`/reciters/${r.id}`}
                className="group relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                {/* Glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-200/30 to-amber-200/30 blur-xl" />
                </div>

                <div className="relative flex items-center gap-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-2xl border border-emerald-100 bg-emerald-50 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-700">
                      {initials(r.name)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-zinc-900 group-hover:text-emerald-700 transition">
                      {r.name}
                    </p>
                    <p className="truncate text-sm text-zinc-600">
                      {r.country} • {r.region}
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                    {r.dialect ? r.dialect : "Dialect: —"}
                  </span>

                  <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    View profile →
                  </span>

                  <span className="ml-auto rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600">
                    {formatDateShort(r.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 overflow-hidden">
            {filtered.map((r) => (
              <Link
                key={String(r.id)}
                href={`/reciters/${r.id}`}
                className="flex items-center gap-4 p-4 sm:p-5 hover:bg-zinc-50 transition"
              >
                <div className="h-12 w-12 rounded-2xl border border-emerald-100 bg-emerald-50 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-700">
                    {initials(r.name)}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-900">{r.name}</p>
                  <p className="truncate text-sm text-zinc-600">
                    {r.country} • {r.region}
                    {r.dialect ? ` • ${r.dialect}` : ""}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Open →
                  </span>
                  <span className="rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600">
                    {formatDateShort(r.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
