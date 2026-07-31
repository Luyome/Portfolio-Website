import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { portfolioItems } from "@/db/schema";
import PortfolioForm from "@/components/admin/PortfolioForm";
import { updatePortfolioItem } from "@/lib/actions/portfolio";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function EditPortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, appearance] = await Promise.all([
    db.select().from(portfolioItems).where(eq(portfolioItems.id, Number(id))).then((rows) => rows[0]),
    getPageAppearance("portfolio"),
  ]);
  if (!item) notFound();

  const updateWithId = updatePortfolioItem.bind(null, item.id);

  return (
    <div>
      <div className="adm-title">Edit Portfolio Item</div>
      <PortfolioForm action={updateWithId} item={item} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
