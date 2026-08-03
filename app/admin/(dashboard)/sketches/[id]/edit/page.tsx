import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { sketches, sketchImages, sketchLinks, sketchVideos } from "@/db/schema";
import SketchForm from "@/components/admin/SketchForm";
import ExtraImagesPanel from "@/components/admin/ExtraImagesPanel";
import ExtraLinksPanel from "@/components/admin/ExtraLinksPanel";
import ExtraVideosPanel from "@/components/admin/ExtraVideosPanel";
import { updateSketch, createSketchImage, updateSketchImage, deleteSketchImage, createSketchLink, updateSketchLink, deleteSketchLink, createSketchVideo, updateSketchVideo, deleteSketchVideo } from "@/lib/actions/sketches";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function EditSketchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sketchId = Number(id);
  const [[item], images, links, videos, appearance] = await Promise.all([
    db.select().from(sketches).where(eq(sketches.id, sketchId)),
    db.select().from(sketchImages).where(eq(sketchImages.sketchId, sketchId)).orderBy(asc(sketchImages.sortOrder)),
    db.select().from(sketchLinks).where(eq(sketchLinks.sketchId, sketchId)).orderBy(asc(sketchLinks.sortOrder)),
    db.select().from(sketchVideos).where(eq(sketchVideos.sketchId, sketchId)).orderBy(asc(sketchVideos.sortOrder)),
    getPageAppearance("sketches"),
  ]);
  if (!item) notFound();

  const updateWithId = updateSketch.bind(null, item.id);
  const createImageWithId = createSketchImage.bind(null, sketchId);
  const createLinkWithId = createSketchLink.bind(null, sketchId);
  const createVideoWithId = createSketchVideo.bind(null, sketchId);

  return (
    <div>
      <div className="adm-title">Edit Sketch</div>
      <SketchForm action={updateWithId} item={item} pageVars={pageAppearanceVars(appearance)} />
      <ExtraImagesPanel images={images} createAction={createImageWithId} updateAction={updateSketchImage} deleteAction={deleteSketchImage} />
      <ExtraVideosPanel videos={videos} createAction={createVideoWithId} updateAction={updateSketchVideo} deleteAction={deleteSketchVideo} />
      <ExtraLinksPanel links={links} createAction={createLinkWithId} updateAction={updateSketchLink} deleteAction={deleteSketchLink} />
    </div>
  );
}
