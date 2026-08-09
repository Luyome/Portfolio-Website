import WorldbuildingForm from "@/components/admin/WorldbuildingForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { createWorldbuildingEntry } from "@/lib/actions/worldbuilding";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getActiveWbMetadataOptionsByType } from "@/lib/worldbuilding-metadata";

export default async function NewWorldbuildingEntryPage() {
  const [appearance, wbOptions] = await Promise.all([
    getPageAppearance("worldbuilding"),
    getActiveWbMetadataOptionsByType(),
  ]);

  return (
    <div>
      <AdminPageHeader title="New Worldbuilding Entry" />
      <WorldbuildingForm
        action={createWorldbuildingEntry}
        pageVars={pageAppearanceVars(appearance)}
        entityTypeOptions={wbOptions.wb_entity_type}
        categoryOptions={wbOptions.wb_category}
        chipOptions={wbOptions.wb_chip}
        selectedChips={[]}
      />
    </div>
  );
}
