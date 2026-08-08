// Small, typed server-side validation helpers for the content mutation
// boundary (the Server Actions in `lib/actions/*`). Not a general-purpose
// validation library — grown only where real mutation paths need the same
// rule. See docs/07_TECHNICAL_ARCHITECTURE.md, section 9 (API Philosophy,
// "all input is validated at the boundary") and section 15 (Security
// Principles, "every input ... is validated before it is trusted").

/** Thrown for a rejected input. `.message` is safe to show to the admin. */
export class ValidationError extends Error {}

function raw(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

/** Required, trimmed text — existing NOT NULL columns with no default and a `required` form field. */
export function requiredText(value: FormDataEntryValue | null, field: string): string {
  const trimmed = raw(value).trim();
  if (!trimmed) throw new ValidationError(`${field} is required.`);
  return trimmed;
}

/** Optional, trimmed text — never throws. For NOT NULL-with-default or genuinely optional columns. */
export function optionalText(value: FormDataEntryValue | null): string {
  return raw(value).trim();
}

/** Optional, trimmed text that becomes `null` when empty — existing nullable text columns. */
export function nullableText(value: FormDataEntryValue | null): string | null {
  const trimmed = raw(value).trim();
  return trimmed || null;
}

/** Required whole number (year, counts, etc.). */
export function requiredInt(value: FormDataEntryValue | null, field: string): number {
  const n = Number(raw(value));
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new ValidationError(`${field} must be a whole number.`);
  }
  return n;
}

/** Positive integer identifier — a required foreign key or primary key input. */
export function requiredId(value: FormDataEntryValue | null | number, field: string): number {
  const n = typeof value === "number" ? value : Number(raw(value));
  if (!Number.isInteger(n) || n <= 0) throw new ValidationError(`${field} is invalid.`);
  return n;
}

/** Optional foreign key input (a typed `number | null`, not read from FormData) — `null` stays `null`. */
export function nullableId(value: number | null, field: string): number | null {
  if (value === null) return null;
  if (!Number.isInteger(value) || value <= 0) throw new ValidationError(`${field} is invalid.`);
  return value;
}

/** Value must be one of `allowed` — an existing, confirmed enum/status set. */
export function oneOf<T extends string>(value: FormDataEntryValue | null, allowed: readonly T[], field: string): T {
  const v = raw(value);
  if (!allowed.includes(v as T)) {
    throw new ValidationError(`${field} must be one of: ${allowed.join(", ")}.`);
  }
  return v as T;
}

// Every current caller of the URL validators below is a genuinely external
// or Blob-hosted media URL (an uploaded image/video, an ArtStation-style
// external link, a downloadable file) — none accept a site-internal relative
// path today (confirmed by reviewing every call site under lib/actions/ and
// lib/form-utils.ts). `http:`/`https:` is therefore the correct, single
// allowed scheme set for all of them, not only `nullableHttpUrl`'s original
// Software-website case — `javascript:`, `data:`, `file:`, and any other
// scheme are rejected as invalid (Sprint 2 Closure Audit, finding 4).
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:"]);

function isSafeUrl(value: string): boolean {
  try {
    return SAFE_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** URL-shaped text for a field that explicitly expects an external or media URL and must be present. */
export function requiredUrl(value: FormDataEntryValue | null, field: string): string {
  const trimmed = raw(value).trim();
  if (!trimmed) throw new ValidationError(`${field} is required.`);
  if (!isSafeUrl(trimmed)) throw new ValidationError(`${field} must be a valid URL.`);
  return trimmed;
}

/** URL-shaped text that may be left empty — existing NOT NULL-with-empty-default or UI-optional URL columns. */
export function optionalUrl(value: FormDataEntryValue | null, field: string): string {
  const trimmed = raw(value).trim();
  if (!trimmed) return "";
  if (!isSafeUrl(trimmed)) throw new ValidationError(`${field} must be a valid URL.`);
  return trimmed;
}

/** URL-shaped text that becomes `null` when empty — existing nullable URL columns. */
export function nullableUrl(value: FormDataEntryValue | null, field: string): string | null {
  const trimmed = raw(value).trim();
  if (!trimmed) return null;
  if (!isSafeUrl(trimmed)) throw new ValidationError(`${field} must be a valid URL.`);
  return trimmed;
}

/**
 * URL-shaped text restricted to a safe `http:`/`https:` scheme, becoming
 * `null` when empty — kept as its own named export (same rule as the three
 * validators above now enforce) since callers already reference it directly
 * for a field that renders as an outbound link.
 */
export function nullableHttpUrl(value: FormDataEntryValue | null, field: string): string | null {
  return nullableUrl(value, field);
}

/** Normalized map coordinate — finite number within the map's established 0–100 range (see MapEditor's clamp). */
export function coordinate(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new ValidationError(`${field} must be between 0 and 100.`);
  }
  return value;
}

/** Whole number within an inclusive `[min, max]` range — typed input, not FormData. Rejects NaN/non-integer/out-of-range. */
export function boundedInt(value: number, min: number, max: number, field: string): number {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < min || value > max) {
    throw new ValidationError(`${field} must be a whole number between ${min} and ${max}.`);
  }
  return value;
}

/** Safe, user-facing message for a caught mutation error — never exposes internals. */
export function safeErrorMessage(err: unknown): string {
  if (err instanceof ValidationError) return err.message;
  return "Could not save — please check the form and try again.";
}
