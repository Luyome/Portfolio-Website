import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { portfolioItems, portfolioImages, portfolioLinks, portfolioVideos } from "@/db/schema";
import PortfolioForm from "@/components/admin/PortfolioForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ExtraImagesPanel from "@/components/admin/ExtraImagesPanel";
import ExtraLinksPanel from "@/components/admin/ExtraLinksPanel";
import ExtraVideosPanel from "@/components/admin/ExtraVideosPanel";
import { updatePortfolioItem, createPortfolioImage, updatePortfolioImage, deletePortfolioImage, createPortfolioLink, updatePortfolioLink, deletePortfolioLink, createPortfolioVideo, updatePortfolioVideo, deletePortfolioVideo } from "@/lib/actions/portfolio";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getActiveMetadataOptionsByType, getPortfolioMetadataSelections } from "@/lib/portfolio-metadata";
import { getActiveLinkLabelOptions } from "@/lib/link-label-options";
import { requiredId } from "@/lib/validation";

export default async function EditPortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let portfolioId: number;
  try {
    portfolioId = requiredId(id, "Portfolio item");
  } catch {
    notFound();
  }
  const [item, images, links, videos, appearance, metadataOptions, metadataSelections, labelOptions] = await Promise.all([
    db.select().from(portfolioItems).where(eq(portfolioItems.id, portfolioId)).then((rows) => rows[0]),
    db.select().from(portfolioImages).where(eq(portfolioImages.portfolioId, portfolioId)).orderBy(asc(portfolioImages.sortOrder)),
    db.select().from(portfolioLinks).where(eq(portfolioLinks.portfolioId, portfolioId)).orderBy(asc(portfolioLinks.sortOrder)),
    db.select().from(portfolioVideos).where(eq(portfolioVideos.portfolioId, portfolioId)).orderBy(asc(portfolioVideos.sortOrder)),
    getPageAppearance("portfolio"),
    getActiveMetadataOptionsByType(),
    getPortfolioMetadataSelections(portfolioId),
    getActiveLinkLabelOptions(),
  ]);
  if (!item) notFound();

  const updateWithId = updatePortfolioItem.bind(null, item.id);
  const createImageWithId = createPortfolioImage.bind(null, portfolioId);
  const createLinkWithId = createPortfolioLink.bind(null, portfolioId);
  const createVideoWithId = createPortfolioVideo.bind(null, portfolioId);

  return (
    <div>
      <AdminPageHeader title="Edit Portfolio Item" />
      <PortfolioForm
        action={updateWithId}
        item={item}
        pageVars={pageAppearanceVars(appearance)}
        metadataOptions={metadataOptions}
        metadataSelections={metadataSelections}
      />
      <ExtraImagesPanel images={images} createAction={createImageWithId} updateAction={updatePortfolioImage} deleteAction={deletePortfolioImage} />
      <ExtraVideosPanel videos={videos} createAction={createVideoWithId} updateAction={updatePortfolioVideo} deleteAction={deletePortfolioVideo} />
      <ExtraLinksPanel links={links} createAction={createLinkWithId} updateAction={updatePortfolioLink} deleteAction={deletePortfolioLink} labelOptions={labelOptions} />
    </div>
  );
}
