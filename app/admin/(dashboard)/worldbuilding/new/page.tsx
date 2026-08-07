import WorldbuildingForm from "@/components/admin/WorldbuildingForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { createWorldbuildingEntry } from "@/lib/actions/worldbuilding";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function NewWorldbuildingEntryPage() {
  const appearance = await getPageAppearance("worldbuilding");

  return (
    <div>
      <AdminPageHeader title="New Worldbuilding Entry" />
      <WorldbuildingForm action={createWorldbuildingEntry} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
