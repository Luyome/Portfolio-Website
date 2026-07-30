import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { games } from "@/db/schema";
import GameForm from "@/components/admin/GameForm";
import { updateGame } from "@/lib/actions/games";

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item] = await db.select().from(games).where(eq(games.id, Number(id)));
  if (!item) notFound();

  const updateWithId = updateGame.bind(null, item.id);

  return (
    <div>
      <div className="adm-title">Edit Game</div>
      <GameForm action={updateWithId} item={item} />
    </div>
  );
}
