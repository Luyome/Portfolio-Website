import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { worldbuildingEntries } from "@/db/schema";
import WorldbuildingForm from "@/components/admin/WorldbuildingForm";
import { updateWorldbuildingEntry } from "@/lib/actions/worldbuilding";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function EditWorldbuildingEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [[item], appearance] = await Promise.all([
    db.select().from(worldbuildingEntries).where(eq(worldbuildingEntries.id, Number(id))),
    getPageAppearance("worldbuilding"),
  ]);
  if (!item) notFound();

  const updateWithId = updateWorldbuildingEntry.bind(null, item.id);

  return (
    <div>
      <div className="adm-title">Edit Worldbuilding Entry</div>
      <WorldbuildingForm action={updateWithId} item={item} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
