import { NextResponse, type NextRequest } from "next/server";

// Vercel Blob files live on a different origin than the site, so the HTML
// `download` attribute on a plain <a href> is silently ignored by browsers
// (it only forces a download for same-origin or blob: URLs) — the link just
// navigates/opens the file instead. Proxying the bytes through our own origin
// with a Content-Disposition header makes the download always actually happen.
//
// This project's own Vercel Blob store hostname — the only source this
// endpoint may ever fetch from. Every Blob store gets its own randomly
// assigned `<random>.public.blob.vercel-storage.com` subdomain, so a
// suffix-wildcard match (the previous behavior) would also accept any OTHER
// Vercel customer's Blob store, turning this route into an open proxy
// (Sprint 2 Closure Audit, finding 5). Confirmed via a one-off read-only
// query across every content table with a stored file/image URL (Portfolio,
// Sketches, Worldbuilding, Games, 3D Models) — this is the only Blob
// hostname ever actually stored; kept as an exact-match constant here
// (deliberately not a shared "any Blob host" constant like
// lib/image-host.ts's next/image allowlist, which has a different,
// lower-risk threat model — this route fetches and re-serves bytes, that one
// only tells next/image what it may optimize).
const ALLOWED_HOST = "gre0tgzra9csfjbt.public.blob.vercel-storage.com";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }

  let upstream: Response;
  try {
    // `redirect: "error"` refuses to silently follow a redirect off the
    // allow-listed host — without it, a redirect response from the
    // (already-validated) upstream host could still hand bytes from
    // somewhere else entirely back through this proxy.
    upstream = await fetch(parsed.toString(), { redirect: "error" });
  } catch {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
  }

  // An explicit `name` (e.g. a link label like "CV" or "Steam Build") has no
  // extension of its own — without the source file's extension appended, the
  // browser saves it extension-less and the OS won't know how to open it.
  const sourceName = parsed.pathname.split("/").pop() || "download";
  const sourceExt = sourceName.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? "";
  const requestedName = request.nextUrl.searchParams.get("name");
  const name = requestedName
    ? requestedName.toLowerCase().endsWith(sourceExt.toLowerCase()) || !sourceExt
      ? requestedName
      : `${requestedName}${sourceExt}`
    : sourceName;
  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
  headers.set("Content-Disposition", `attachment; filename="${name.replace(/"/g, "")}"`);
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new NextResponse(upstream.body, { headers });
}
