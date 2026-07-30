import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { portfolioItems } from "@/db/schema";
import PortfolioForm from "@/components/admin/PortfolioForm";
import { updatePortfolioItem } from "@/lib/actions/portfolio";

export default async function EditPortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, Number(id)));
  if (!item) notFound();

  const updateWithId = updatePortfolioItem.bind(null, item.id);

  return (
    <div>
      <div className="adm-title">Edit Portfolio Item</div>
      <PortfolioForm action={updateWithId} item={item} />
    </div>
  );
}
