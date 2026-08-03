import { NextResponse, type NextRequest } from "next/server";

// Vercel Blob files live on a different origin than the site, so the HTML
// `download` attribute on a plain <a href> is silently ignored by browsers
// (it only forces a download for same-origin or blob: URLs) — the link just
// navigates/opens the file instead. Proxying the bytes through our own origin
// with a Content-Disposition header makes the download always actually happen.
const ALLOWED_HOST_SUFFIX = ".public.blob.vercel-storage.com";

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
  if (!parsed.hostname.endsWith(ALLOWED_HOST_SUFFIX)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }

  const upstream = await fetch(parsed.toString());
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
