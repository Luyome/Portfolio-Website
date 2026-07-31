import GameForm from "@/components/admin/GameForm";
import { createGame } from "@/lib/actions/games";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function NewGamePage() {
  const appearance = await getPageAppearance("games");

  return (
    <div>
      <div className="adm-title">New Game</div>
      <GameForm action={createGame} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
