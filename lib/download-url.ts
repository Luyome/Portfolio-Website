// Routes a Vercel Blob file URL through /api/download so the browser always
// actually downloads it (see app/api/download/route.ts for why the plain
// `download` attribute alone doesn't work for these cross-origin URLs).
export function downloadUrl(src: string, filename?: string): string {
  const params = new URLSearchParams({ url: src });
  if (filename) params.set("name", filename);
  return `/api/download?${params.toString()}`;
}
