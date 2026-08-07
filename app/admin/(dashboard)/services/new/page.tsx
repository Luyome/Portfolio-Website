import ServiceForm from "@/components/admin/ServiceForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { createService } from "@/lib/actions/services";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function NewServicePage() {
  const appearance = await getPageAppearance("home");

  return (
    <div>
      <AdminPageHeader title="New Service" />
      <ServiceForm action={createService} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
