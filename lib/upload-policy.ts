// Single source of truth for what an Admin media upload is allowed to be —
// shared between the client upload components (preflight, before any bytes
// leave the browser) and the Blob route handlers (`onBeforeGenerateToken`,
// before a client token is ever issued). Pure and dependency-free so it can
// be imported from both a "use client" component and a server Route Handler.
//
// Categories match the upload flows that actually exist in the app today —
// see app/api/admin/blob-upload{,-file}/route.ts. Not a general file-upload
// framework: adding a category here means a real, existing upload flow needs
// it, not that one might exist later.

export type UploadCategory = "image" | "document" | "gameBuild";

/**
 * Thrown by a Blob route's `onBeforeGenerateToken` for a rejected file or
 * category (bad extension, unrecognized/missing category tag) — distinct
 * from an unexpected failure elsewhere in `handleUpload`, so the route can
 * return a generic 400 for this and a generic 500 for everything else,
 * without ever forwarding `.message` (which may include Blob/provider
 * detail) to the client (Sprint 2 Closure Audit, finding 2). `.message`
 * itself stays safe to log server-side, never secret.
 */
export class UploadPolicyError extends Error {}

type ExtensionRule = {
  /** Content-Type values a browser may legitimately report for this extension. */
  mimeTypes: readonly string[];
  /** Content-Type handed to Blob for the actual PUT — the first, most specific entry. */
  canonicalMimeType: string;
};

type CategoryPolicy = {
  /** Human-readable summary shown next to the file input. */
  label: string;
  maxBytes: number;
  extensions: Readonly<Record<string, ExtensionRule>>;
};

const OCTET_STREAM = "application/octet-stream";

const IMAGE_EXTENSIONS: Readonly<Record<string, ExtensionRule>> = {
  jpg: { mimeTypes: ["image/jpeg"], canonicalMimeType: "image/jpeg" },
  jpeg: { mimeTypes: ["image/jpeg"], canonicalMimeType: "image/jpeg" },
  png: { mimeTypes: ["image/png"], canonicalMimeType: "image/png" },
  webp: { mimeTypes: ["image/webp"], canonicalMimeType: "image/webp" },
  gif: { mimeTypes: ["image/gif"], canonicalMimeType: "image/gif" },
  avif: { mimeTypes: ["image/avif"], canonicalMimeType: "image/avif" },
};

export const UPLOAD_POLICIES: Readonly<Record<UploadCategory, CategoryPolicy>> = {
  // ImageUploadField, ContentEditor's inline "Insert Image", MapPinEditPanel's
  // pin image — everything going through /api/admin/blob-upload.
  image: {
    label: "JPEG, PNG, WebP, GIF, or AVIF — up to 10MB",
    maxBytes: 10 * 1024 * 1024,
    extensions: IMAGE_EXTENSIONS,
  },
  // The CV upload (an image or a PDF) — the "document" side of
  // /api/admin/blob-upload-file.
  document: {
    label: "PDF, JPEG, PNG, WebP, or GIF — up to 15MB",
    maxBytes: 15 * 1024 * 1024,
    extensions: {
      pdf: { mimeTypes: ["application/pdf"], canonicalMimeType: "application/pdf" },
      jpg: { mimeTypes: ["image/jpeg"], canonicalMimeType: "image/jpeg" },
      jpeg: { mimeTypes: ["image/jpeg"], canonicalMimeType: "image/jpeg" },
      png: { mimeTypes: ["image/png"], canonicalMimeType: "image/png" },
      webp: { mimeTypes: ["image/webp"], canonicalMimeType: "image/webp" },
      gif: { mimeTypes: ["image/gif"], canonicalMimeType: "image/gif" },
    },
  },
  // Downloadable game build links (AddLinkForm's "Download" kind) — the
  // "game build" side of /api/admin/blob-upload-file. Archives and installers
  // are the actual deliverable here, not a source/master asset — this is the
  // pre-existing, intentional format list from that route (see its own
  // comment); browsers commonly report these as generic octet-stream, so
  // that's accepted alongside each format's specific MIME type.
  gameBuild: {
    label: "ZIP, 7z, RAR, EXE, DMG, GZ, TAR, or PDF — up to 300MB",
    maxBytes: 300 * 1024 * 1024,
    extensions: {
      zip: { mimeTypes: ["application/zip", "application/x-zip-compressed", OCTET_STREAM], canonicalMimeType: "application/zip" },
      "7z": { mimeTypes: ["application/x-7z-compressed", OCTET_STREAM], canonicalMimeType: "application/x-7z-compressed" },
      rar: { mimeTypes: ["application/x-rar-compressed", "application/vnd.rar", OCTET_STREAM], canonicalMimeType: "application/vnd.rar" },
      exe: { mimeTypes: ["application/x-msdownload", OCTET_STREAM], canonicalMimeType: "application/x-msdownload" },
      dmg: { mimeTypes: ["application/x-apple-diskimage", OCTET_STREAM], canonicalMimeType: "application/x-apple-diskimage" },
      gz: { mimeTypes: ["application/gzip", OCTET_STREAM], canonicalMimeType: "application/gzip" },
      tar: { mimeTypes: ["application/x-tar", OCTET_STREAM], canonicalMimeType: "application/x-tar" },
      pdf: { mimeTypes: ["application/pdf"], canonicalMimeType: "application/pdf" },
    },
  },
};

/** `accept` attribute value for a category's file input, derived from the same list servers enforce. */
export function acceptAttrFor(category: UploadCategory): string {
  return Object.keys(UPLOAD_POLICIES[category].extensions)
    .map((ext) => `.${ext}`)
    .join(",");
}

export function describeUploadPolicy(category: UploadCategory): string {
  return UPLOAD_POLICIES[category].label;
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0 || dot === fileName.length - 1) return "";
  return fileName.slice(dot + 1).toLowerCase();
}

// Control characters (0x00–0x1F, 0x7F) — built from char codes rather than a
// literal regex range so no unescaped control bytes sit in this source file.
const CONTROL_CHARS = new RegExp(
  "[" + Array.from({ length: 33 }, (_, i) => String.fromCharCode(i < 32 ? i : 127)).join("") + "]",
  "g"
);

/**
 * Strips directories, control characters, and path-traversal sequences from a
 * user-supplied file name, keeping only a safe basename. Never throws — an
 * empty/all-unsafe name collapses to "file" plus the original extension so
 * callers can still form a usable pathname.
 */
export function sanitizeFileName(fileName: string): string {
  // Basename only — drop any directory component from either separator style.
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  const ext = extensionOf(base);
  const stem = ext ? base.slice(0, base.length - ext.length - 1) : base;
  const cleanStem = stem
    .replace(CONTROL_CHARS, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 100);
  const safeStem = cleanStem || "file";
  return ext ? `${safeStem}.${ext}` : safeStem;
}

export type UploadCheckResult =
  | { ok: true; fileName: string; contentType: string }
  | { ok: false; error: string };

/**
 * The one check both the client preflight and the server route run before a
 * file is allowed anywhere near Blob: extension in the category's allow-list
 * and size within its limit. Returns a safe file name and the canonical
 * Content-Type to upload with — never the browser-reported one — so a
 * mismatched extension/MIME pair can't slip through as some third value.
 */
export function checkUpload(category: UploadCategory, fileName: string, fileSize: number): UploadCheckResult {
  const policy = UPLOAD_POLICIES[category];
  const safeName = sanitizeFileName(fileName);
  const ext = extensionOf(safeName);
  const rule = ext ? policy.extensions[ext] : undefined;
  if (!rule) {
    return { ok: false, error: `Unsupported file type. Allowed: ${policy.label}` };
  }
  if (fileSize > policy.maxBytes) {
    const maxMb = Math.round(policy.maxBytes / (1024 * 1024));
    return { ok: false, error: `File is too large. Maximum size is ${maxMb}MB.` };
  }
  return { ok: true, fileName: safeName, contentType: rule.canonicalMimeType };
}

/** Server-side re-check from just a pathname (no size available at token-generation time — Blob enforces `maximumSizeInBytes` itself during the PUT). */
export function allowedContentTypesForPathname(category: UploadCategory, pathname: string): readonly string[] | null {
  const ext = extensionOf(sanitizeFileName(pathname));
  const rule = ext ? UPLOAD_POLICIES[category].extensions[ext] : undefined;
  return rule ? rule.mimeTypes : null;
}

export function maxBytesFor(category: UploadCategory): number {
  return UPLOAD_POLICIES[category].maxBytes;
}
