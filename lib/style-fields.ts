import type { CSSProperties } from "react";
import type { FieldStyle, StylesMap, ThemedColor } from "@/db/schema";

export type { FieldStyle, StylesMap, ThemedColor };

export function readStyles(formData: FormData, keys: string[]): StylesMap {
  const result: StylesMap = {};
  for (const key of keys) {
    const dark = formData.get(`sc_${key}_dark`);
    const light = formData.get(`sc_${key}_light`);
    const fontSize = formData.get(`sf_${key}`);
    const entry: FieldStyle = {};
    const color: ThemedColor = {};
    if (typeof dark === "string" && dark) color.dark = dark;
    if (typeof light === "string" && light) color.light = light;
    if (color.dark || color.light) entry.color = color;
    if (typeof fontSize === "string" && fontSize) entry.fontSize = fontSize;
    if (entry.color || entry.fontSize) result[key] = entry;
  }
  return result;
}

export function fieldStyle(styles: StylesMap | null | undefined, key: string): CSSProperties | undefined {
  const s = styles?.[key];
  if (!s || (!s.color?.dark && !s.color?.light && !s.fontSize)) return undefined;
  const vars: Record<string, string> = {};
  if (s.color?.dark) vars["--fc-d"] = s.color.dark;
  if (s.color?.light) vars["--fc-l"] = s.color.light;
  return { ...vars, fontSize: s.fontSize } as CSSProperties;
}

// Remaps a source styles map onto different keys, e.g. when a table's real column
// name (`label`, `excerpt`) differs from the generic display key a shared component expects.
export function remapStyles(source: StylesMap | undefined, keyMap: Record<string, string>): StylesMap {
  const result: StylesMap = {};
  for (const [fromKey, toKey] of Object.entries(keyMap)) {
    const value = source?.[fromKey];
    if (value) result[toKey] = value;
  }
  return result;
}
