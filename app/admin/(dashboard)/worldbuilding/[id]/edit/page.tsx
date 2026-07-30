import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { worldbuildingEntries } from "@/db/schema";
import WorldbuildingForm from "@/components/admin/WorldbuildingForm";
import { updateWorldbuildingEntry } from "@/lib/actions/worldbuilding";

export default async function EditWorldbuildingEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item] = await db.select().from(worldbuildingEntries).where(eq(worldbuildingEntries.id, Number(id)));
  if (!item) notFound();

  const updateWithId = updateWorldbuildingEntry.bind(null, item.id);

  return (
    <div>
      <div className="adm-title">Edit Worldbuilding Entry</div>
      <WorldbuildingForm action={updateWithId} item={item} />
    </div>
  );
}
