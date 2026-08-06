import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { games, gameLinks, gameImages, gameVideos } from "@/db/schema";
import GameForm from "@/components/admin/GameForm";
import ExtraImagesPanel from "@/components/admin/ExtraImagesPanel";
import ExtraLinksPanel from "@/components/admin/ExtraLinksPanel";
import ExtraVideosPanel from "@/components/admin/ExtraVideosPanel";
import { updateGame, createGameLink, updateGameLink, deleteGameLink, createGameImage, updateGameImage, deleteGameImage, createGameVideo, updateGameVideo, deleteGameVideo } from "@/lib/actions/games";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { requiredId } from "@/lib/validation";

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let gameId: number;
  try {
    gameId = requiredId(id, "Game");
  } catch {
    notFound();
  }
  const [item] = await db.select().from(games).where(eq(games.id, gameId));
  if (!item) notFound();

  const [links, images, videos, appearance] = await Promise.all([
    db.select().from(gameLinks).where(eq(gameLinks.gameId, gameId)).orderBy(asc(gameLinks.sortOrder)),
    db.select().from(gameImages).where(eq(gameImages.gameId, gameId)).orderBy(asc(gameImages.sortOrder)),
    db.select().from(gameVideos).where(eq(gameVideos.gameId, gameId)).orderBy(asc(gameVideos.sortOrder)),
    getPageAppearance("games"),
  ]);

  const updateWithId = updateGame.bind(null, item.id);
  const createLinkWithId = createGameLink.bind(null, gameId);
  const createImageWithId = createGameImage.bind(null, gameId);
  const createVideoWithId = createGameVideo.bind(null, gameId);

  return (
    <div>
      <div className="adm-title">Edit Game</div>
      <GameForm action={updateWithId} item={item} pageVars={pageAppearanceVars(appearance)} />
      <ExtraImagesPanel images={images} createAction={createImageWithId} updateAction={updateGameImage} deleteAction={deleteGameImage} />
      <ExtraVideosPanel videos={videos} createAction={createVideoWithId} updateAction={updateGameVideo} deleteAction={deleteGameVideo} />
      <ExtraLinksPanel links={links} createAction={createLinkWithId} updateAction={updateGameLink} deleteAction={deleteGameLink} />
    </div>
  );
}
