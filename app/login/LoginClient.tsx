"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Sign in to upload recitations.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-600">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@email.com"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            {msg ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {msg}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-xs text-zinc-500">
            Tip: Create your admin user in Supabase → Authentication → Users.
          </p>
        </div>
      </div>
    </main>
  );
}
