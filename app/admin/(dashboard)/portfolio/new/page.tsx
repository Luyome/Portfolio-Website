import PortfolioForm from "@/components/admin/PortfolioForm";
import { createPortfolioItem } from "@/lib/actions/portfolio";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getActiveMetadataOptionsByType } from "@/lib/portfolio-metadata";

export default async function NewPortfolioItemPage() {
  const [appearance, metadataOptions] = await Promise.all([
    getPageAppearance("portfolio"),
    getActiveMetadataOptionsByType(),
  ]);

  return (
    <div>
      <div className="adm-title">New Portfolio Item</div>
      <PortfolioForm action={createPortfolioItem} pageVars={pageAppearanceVars(appearance)} metadataOptions={metadataOptions} />
    </div>
  );
}
