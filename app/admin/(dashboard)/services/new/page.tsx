import ServiceForm from "@/components/admin/ServiceForm";
import { createService } from "@/lib/actions/services";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function NewServicePage() {
  const appearance = await getPageAppearance("home");

  return (
    <div>
      <div className="adm-title">New Service</div>
      <ServiceForm action={createService} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
