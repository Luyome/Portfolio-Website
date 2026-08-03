import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { portfolioItems, portfolioImages, portfolioLinks, portfolioVideos } from "@/db/schema";
import PortfolioBrowser from "@/components/PortfolioBrowser";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { groupImagesByParent } from "@/lib/group-images";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
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
      <div className="ph">
        <div className="ph-wm">作品</div>
        <div className="ph-eyebrow">Works</div>
        <h2 className="ph-title">Portfolio</h2>
        <p className="ph-sub">3D characters and concept art.</p>
      </div>
      <PortfolioBrowser items={itemsWithImages} initialYear={year} />
    </div>
  );
}
