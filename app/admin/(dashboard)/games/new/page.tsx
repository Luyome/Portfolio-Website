import GameForm from "@/components/admin/GameForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { createGame } from "@/lib/actions/games";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function NewGamePage() {
  const appearance = await getPageAppearance("games");

  return (
    <div>
      <AdminPageHeader title="New Game" />
      <GameForm action={createGame} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
