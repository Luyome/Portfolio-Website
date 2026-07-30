import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { portfolioItems } from "@/db/schema";
import PortfolioBrowser from "@/components/PortfolioBrowser";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const items = await db
    .select()
    .from(portfolioItems)
    .orderBy(desc(portfolioItems.year), asc(portfolioItems.sortOrder));

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-wm">作品</div>
        <div className="ph-eyebrow">Works</div>
        <h2 className="ph-title">Portfolio</h2>
        <p className="ph-sub">3D characters and concept art.</p>
      </div>
      <PortfolioBrowser items={items} initialYear={year} />
    </div>
  );
}
