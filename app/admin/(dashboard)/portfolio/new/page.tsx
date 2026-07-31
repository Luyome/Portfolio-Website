import PortfolioForm from "@/components/admin/PortfolioForm";
import { createPortfolioItem } from "@/lib/actions/portfolio";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function NewPortfolioItemPage() {
  const appearance = await getPageAppearance("portfolio");

  return (
    <div>
      <div className="adm-title">New Portfolio Item</div>
      <PortfolioForm action={createPortfolioItem} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
