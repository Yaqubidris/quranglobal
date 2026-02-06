"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Reciters", href: "/reciters" },
  { label: "Recitations", href: "/recitations" },
  { label: "Surahs", href: "/surahs" },
  { label: "About", href: "/about" },
//   { label: "Recent", href: "/recently-played" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white font-bold">
            Q
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-900">
            Qur’an Global
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition
                  ${
                    active
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/recitations"
            className="ml-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Explore
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-zinc-800" />
            <span className="block h-0.5 w-5 bg-zinc-800" />
            <span className="block h-0.5 w-5 bg-zinc-800" />
          </div>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-zinc-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition
                    ${
                      active
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/recitations"
              className="mt-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
                
              Explore
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
