import type { Metadata } from "next";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { portfolioItems, portfolioImages, portfolioLinks, portfolioVideos } from "@/db/schema";
import PortfolioBrowser from "@/components/PortfolioBrowser";
import PageHeader from "@/components/PageHeader";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { groupImagesByParent } from "@/lib/group-images";
import { parseContentItemId } from "@/lib/content-detail-href";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "3D character and concept art — professional visual work by Ege Demir Ünal (TETSUNARU).",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; item?: string | string[] }>;
}) {
  const { year, item } = await searchParams;
  const [items, imageRows, linkRows, videoRows, appearance] = await Promise.all([
    db.select().from(portfolioItems).orderBy(desc(portfolioItems.year), asc(portfolioItems.sortOrder)),
    db.select().from(portfolioImages).orderBy(asc(portfolioImages.sortOrder)),
    db.select().from(portfolioLinks).orderBy(asc(portfolioLinks.sortOrder)),
    db.select().from(portfolioVideos).orderBy(asc(portfolioVideos.sortOrder)),
    getPageAppearance("portfolio"),
  ]);
  const imagesByItem = groupImagesByParent(imageRows, (r) => r.portfolioId);
  const videosByItem = groupImagesByParent(videoRows, (r) => r.portfolioId);
  const itemsWithImages = items.map((p) => ({
    ...p,
    images: imagesByItem.get(p.id) ?? [],
    videos: videosByItem.get(p.id) ?? [],
    links: linkRows.filter((l) => l.portfolioId === p.id),
  }));

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <PageHeader watermark="作品" eyebrow="Works" title="Portfolio" subtitle="3D characters and concept art." />
      <PortfolioBrowser items={itemsWithImages} initialYear={year} initialItemId={parseContentItemId(item)} />
    </div>
  );
}
