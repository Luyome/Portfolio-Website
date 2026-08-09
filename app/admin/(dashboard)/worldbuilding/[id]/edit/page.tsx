import { asc, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { worldbuildingEntries, worldbuildingImages, worldbuildingLinks, worldbuildingVideos } from "@/db/schema";
import WorldbuildingForm from "@/components/admin/WorldbuildingForm";
import WorldbuildingRelationshipsPanel from "@/components/admin/WorldbuildingRelationshipsPanel";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ExtraImagesPanel from "@/components/admin/ExtraImagesPanel";
import ExtraLinksPanel from "@/components/admin/ExtraLinksPanel";
import ExtraVideosPanel from "@/components/admin/ExtraVideosPanel";
import { updateWorldbuildingEntry, createWorldbuildingImage, updateWorldbuildingImage, deleteWorldbuildingImage, createWorldbuildingLink, updateWorldbuildingLink, deleteWorldbuildingLink, createWorldbuildingVideo, updateWorldbuildingVideo, deleteWorldbuildingVideo, createWorldbuildingRelationship, deleteWorldbuildingRelationship } from "@/lib/actions/worldbuilding";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getActiveLinkLabelOptions } from "@/lib/link-label-options";
import { getRelatedWorldbuildingEntitySummaries } from "@/lib/worldbuilding-data";
import { getActiveWbMetadataOptionsByType, getWorldbuildingMetadataSelections } from "@/lib/worldbuilding-metadata";
import { requiredId } from "@/lib/validation";

export default async function EditWorldbuildingEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let entryId: number;
  try {
    entryId = requiredId(id, "Worldbuilding entry");
  } catch {
    notFound();
  }
  const [[item], images, links, videos, appearance, labelOptions, relationships, otherEntries, wbOptions, wbSelections] = await Promise.all([
    db.select().from(worldbuildingEntries).where(eq(worldbuildingEntries.id, entryId)),
    db.select().from(worldbuildingImages).where(eq(worldbuildingImages.entryId, entryId)).orderBy(asc(worldbuildingImages.sortOrder)),
    db.select().from(worldbuildingLinks).where(eq(worldbuildingLinks.entryId, entryId)).orderBy(asc(worldbuildingLinks.sortOrder)),
    db.select().from(worldbuildingVideos).where(eq(worldbuildingVideos.entryId, entryId)).orderBy(asc(worldbuildingVideos.sortOrder)),
    getPageAppearance("worldbuilding"),
    getActiveLinkLabelOptions(),
    getRelatedWorldbuildingEntitySummaries(entryId),
    db.select({ id: worldbuildingEntries.id, title: worldbuildingEntries.title }).from(worldbuildingEntries).where(ne(worldbuildingEntries.id, entryId)).orderBy(asc(worldbuildingEntries.title)),
    getActiveWbMetadataOptionsByType(),
    getWorldbuildingMetadataSelections(entryId),
  ]);
  if (!item) notFound();

  const updateWithId = updateWorldbuildingEntry.bind(null, item.id);
  const createImageWithId = createWorldbuildingImage.bind(null, entryId);
  const createLinkWithId = createWorldbuildingLink.bind(null, entryId);
  const createVideoWithId = createWorldbuildingVideo.bind(null, entryId);

  return (
    <div>
      <AdminPageHeader title="Edit Worldbuilding Entry" />
      <WorldbuildingForm
        action={updateWithId}
        item={item}
        pageVars={pageAppearanceVars(appearance)}
        entityTypeOptions={wbOptions.wb_entity_type}
        categoryOptions={wbOptions.wb_category}
        chipOptions={wbOptions.wb_chip}
        selectedEntityType={wbSelections.wb_entity_type[0]}
        selectedCategory={wbSelections.wb_category[0]}
        selectedChips={wbSelections.wb_chip}
      />
      <div className="adm-editor-extras">
        <ExtraImagesPanel images={images} createAction={createImageWithId} updateAction={updateWorldbuildingImage} deleteAction={deleteWorldbuildingImage} />
        <ExtraVideosPanel videos={videos} createAction={createVideoWithId} updateAction={updateWorldbuildingVideo} deleteAction={deleteWorldbuildingVideo} />
        <ExtraLinksPanel links={links} createAction={createLinkWithId} updateAction={updateWorldbuildingLink} deleteAction={deleteWorldbuildingLink} labelOptions={labelOptions} />
        <WorldbuildingRelationshipsPanel
          entryId={entryId}
          relationships={relationships}
          otherEntries={otherEntries}
          createAction={createWorldbuildingRelationship}
          deleteAction={deleteWorldbuildingRelationship}
        />
      </div>
    </div>
  );
}
