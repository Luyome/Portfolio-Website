import PortfolioForm from "@/components/admin/PortfolioForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
      <AdminPageHeader title="New Portfolio Item" />
      <PortfolioForm action={createPortfolioItem} pageVars={pageAppearanceVars(appearance)} metadataOptions={metadataOptions} />
    </div>
  );
}
