import GameForm from "@/components/admin/GameForm";
import { createGame } from "@/lib/actions/games";

export default function NewGamePage() {
  return (
    <div>
      <div className="adm-title">New Game</div>
      <GameForm action={createGame} />
    </div>
  );
}
