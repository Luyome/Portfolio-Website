import WorldbuildingForm from "@/components/admin/WorldbuildingForm";
import { createWorldbuildingEntry } from "@/lib/actions/worldbuilding";

export default function NewWorldbuildingEntryPage() {
  return (
    <div>
      <div className="adm-title">New Worldbuilding Entry</div>
      <WorldbuildingForm action={createWorldbuildingEntry} />
    </div>
  );
}
