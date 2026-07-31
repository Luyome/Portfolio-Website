import WorldbuildingForm from "@/components/admin/WorldbuildingForm";
import { createWorldbuildingEntry } from "@/lib/actions/worldbuilding";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function NewWorldbuildingEntryPage() {
  const appearance = await getPageAppearance("worldbuilding");

  return (
    <div>
      <div className="adm-title">New Worldbuilding Entry</div>
      <WorldbuildingForm action={createWorldbuildingEntry} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
