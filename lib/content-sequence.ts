import type { MediaEntry } from "@/lib/group-images";
import { toEmbedUrl } from "@/lib/video-embed";

export type SeqEntry =
  | { kind: "image"; order: number; url: string; caption?: string | null }
  | { kind: "video"; order: number; embed: string; caption?: string | null };

/**
 * Merge-sorts an entry's extra gallery images/videos by their shared `order`
 * value (sortOrder). Shared by GalleryModal and the Worldbuilding Artwork
 * Detail / Lore Reader components so all three agree on gallery ordering
 * without duplicating the merge logic.
 */
export function buildMediaSequence(item: { images?: MediaEntry[]; videos?: MediaEntry[] }): SeqEntry[] {
  const imageEntries: SeqEntry[] = (item.images ?? []).map((im) => ({
    kind: "image",
    order: im.order,
    url: im.url,
    caption: im.caption,
  }));
  const videoEntries: SeqEntry[] = (item.videos ?? [])
    .map((v) => ({ order: v.order, embed: toEmbedUrl(v.url), caption: v.caption }))
    .filter((v): v is { order: number; embed: string; caption: string | null | undefined } => !!v.embed)
    .map((v) => ({ kind: "video" as const, order: v.order, embed: v.embed, caption: v.caption }));
  return [...imageEntries, ...videoEntries].sort((a, b) => a.order - b.order);
}
