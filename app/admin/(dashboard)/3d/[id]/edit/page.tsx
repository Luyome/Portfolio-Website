import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { models3d, model3dImages, model3dLinks, model3dVideos } from "@/db/schema";
import Model3DForm from "@/components/admin/Model3DForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ExtraImagesPanel from "@/components/admin/ExtraImagesPanel";
import ExtraLinksPanel from "@/components/admin/ExtraLinksPanel";
import ExtraVideosPanel from "@/components/admin/ExtraVideosPanel";
import { updateModel3D, createModel3DImage, updateModel3DImage, deleteModel3DImage, createModel3DLink, updateModel3DLink, deleteModel3DLink, createModel3DVideo, updateModel3DVideo, deleteModel3DVideo } from "@/lib/actions/models3d";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getActiveLinkLabelOptions } from "@/lib/link-label-options";
import { getActiveArtMetadataOptions, getModel3DCategorySelection } from "@/lib/art-metadata";
import { requiredId } from "@/lib/validation";

export default async function EditModel3DPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let modelId: number;
  try {
    modelId = requiredId(id, "3D model");
  } catch {
    notFound();
  }
  const [[item], images, links, videos, appearance, labelOptions, categoryOptions, selectedCategory] = await Promise.all([
    db.select().from(models3d).where(eq(models3d.id, modelId)),
    db.select().from(model3dImages).where(eq(model3dImages.modelId, modelId)).orderBy(asc(model3dImages.sortOrder)),
    db.select().from(model3dLinks).where(eq(model3dLinks.modelId, modelId)).orderBy(asc(model3dLinks.sortOrder)),
    db.select().from(model3dVideos).where(eq(model3dVideos.modelId, modelId)).orderBy(asc(model3dVideos.sortOrder)),
    getPageAppearance("3d"),
    getActiveLinkLabelOptions(),
    getActiveArtMetadataOptions("3d"),
    getModel3DCategorySelection(modelId),
  ]);
  if (!item) notFound();

  const updateWithId = updateModel3D.bind(null, item.id);
  const createImageWithId = createModel3DImage.bind(null, modelId);
  const createLinkWithId = createModel3DLink.bind(null, modelId);
  const createVideoWithId = createModel3DVideo.bind(null, modelId);

  return (
    <div>
      <AdminPageHeader title="Edit 3D Model" />
      <Model3DForm
        action={updateWithId}
        item={item}
        pageVars={pageAppearanceVars(appearance)}
        categoryOptions={categoryOptions}
        selectedCategory={selectedCategory}
      />
      <div className="adm-editor-extras">
        <ExtraImagesPanel images={images} createAction={createImageWithId} updateAction={updateModel3DImage} deleteAction={deleteModel3DImage} />
        <ExtraVideosPanel videos={videos} createAction={createVideoWithId} updateAction={updateModel3DVideo} deleteAction={deleteModel3DVideo} />
        <ExtraLinksPanel links={links} createAction={createLinkWithId} updateAction={updateModel3DLink} deleteAction={deleteModel3DLink} labelOptions={labelOptions} />
      </div>
    </div>
  );
}
