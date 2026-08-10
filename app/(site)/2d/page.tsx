import type { Metadata } from "next";
import { desc, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sketches, sketchImages, sketchLinks, sketchVideos, sketchMetadataOptions, metadataOptions } from "@/db/schema";
import SketchGrid from "@/components/SketchGrid";
import PageHeader from "@/components/PageHeader";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getActiveArtMetadataOptions } from "@/lib/art-metadata";
import { groupImagesByParent } from "@/lib/group-images";
import { parseContentItemId } from "@/lib/content-detail-href";

export const metadata: Metadata = {
  title: "2D",
  description: "Personal sketches and studies by Ege Demir Ünal — unfiltered work outside the curated portfolio.",
  alternates: { canonical: "/2d" },
};

export default async function TwoDPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; category?: string; item?: string | string[] }>;
}) {
  const { year, category, item } = await searchParams;
  const [items, imageRows, linkRows, videoRows, appearance, categories, categoryRows] = await Promise.all([
    db.select().from(sketches).orderBy(desc(sketches.date), asc(sketches.sortOrder)),
    db.select().from(sketchImages).orderBy(asc(sketchImages.sortOrder)),
    db.select().from(sketchLinks).orderBy(asc(sketchLinks.sortOrder)),
    db.select().from(sketchVideos).orderBy(asc(sketchVideos.sortOrder)),
    getPageAppearance("2d"),
    getActiveArtMetadataOptions("2d"),
    db
      .select({ sketchId: sketchMetadataOptions.sketchId, id: metadataOptions.id, name: metadataOptions.name, slug: metadataOptions.slug })
      .from(sketchMetadataOptions)
      .innerJoin(metadataOptions, eq(sketchMetadataOptions.metadataOptionId, metadataOptions.id)),
  ]);
  const imagesByItem = groupImagesByParent(imageRows, (r) => r.sketchId);
  const videosByItem = groupImagesByParent(videoRows, (r) => r.sketchId);
  const categoryBySketch = new Map(categoryRows.map((r) => [r.sketchId, { id: r.id, name: r.name, slug: r.slug }]));
  const itemsWithImages = items.map((s) => ({
    ...s,
    images: imagesByItem.get(s.id) ?? [],
    videos: videosByItem.get(s.id) ?? [],
    links: linkRows.filter((l) => l.sketchId === s.id),
    category: categoryBySketch.get(s.id) ?? null,
  }));

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <PageHeader
        watermark="落書き"
        eyebrow="Raw Drawings"
        title="2D"
        subtitle="Personal sketches and studies — unfiltered."
      />
      <SketchGrid
        items={itemsWithImages}
        categories={categories}
        initialYear={year}
        initialCategory={category}
        initialItemId={parseContentItemId(item)}
      />
    </div>
  );
}
