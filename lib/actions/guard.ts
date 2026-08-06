import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Defense-in-depth session check for owner-only Server Actions.
//
// `proxy.ts`'s `/admin/:path*` matcher protects admin *pages*, but a Server
// Action is reachable by its action ID independent of the page route that
// imports it — a POST carrying the right `Next-Action` header is not
// guaranteed to hit a matched path. Every mutation in `lib/actions/*` must
// therefore call this first, before any input parsing or database/Blob
// mutation. Not marked "use server": it's a plain helper composed into
// "use server" action files, not a callable endpoint of its own.
//
// Redirects to /admin/login on a missing/invalid session. `redirect()`
// throws internally (NEXT_REDIRECT) — never call this inside a try/catch
// that would swallow that throw.
export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const valid = token ? await verifySessionToken(token) : false;
  if (!valid) {
    redirect("/admin/login");
  }
}
