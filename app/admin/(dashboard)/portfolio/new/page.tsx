import PortfolioForm from "@/components/admin/PortfolioForm";
import { createPortfolioItem } from "@/lib/actions/portfolio";

export default function NewPortfolioItemPage() {
  return (
    <div>
      <div className="adm-title">New Portfolio Item</div>
      <PortfolioForm action={createPortfolioItem} />
    </div>
  );
}
