import { createClient } from "@supabase/supabase-js";

export type RequireAdminResult = {
  ok: true;
  userId: string;
  email: string | null;
} | {
  ok: false;
  status: number;
  message: string;
};

export async function requireAdminFromRequest(req: Request): Promise<RequireAdminResult> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { ok: false, status: 401, message: "Missing auth token" };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return { ok: false, status: 500, message: "Supabase env not set (URL/ANON)" };
  }

  // Verify the token belongs to a real logged-in user
  const authClient = createClient(url, anon);
  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data?.user) {
    return { ok: false, status: 401, message: "Invalid or expired session" };
  }

  // ✅ For now: any authenticated user is treated as admin.
  // Later, we can restrict by email allowlist or a profiles.role column.
  return { ok: true, userId: data.user.id, email: data.user.email ?? null };
}
