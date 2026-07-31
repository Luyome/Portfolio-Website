import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { sketches } from "@/db/schema";
import SketchForm from "@/components/admin/SketchForm";
import { updateSketch } from "@/lib/actions/sketches";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function EditSketchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [[item], appearance] = await Promise.all([
    db.select().from(sketches).where(eq(sketches.id, Number(id))),
    getPageAppearance("sketches"),
  ]);
  if (!item) notFound();

  const updateWithId = updateSketch.bind(null, item.id);

  return (
    <div>
      <div className="adm-title">Edit Sketch</div>
      <SketchForm action={updateWithId} item={item} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
