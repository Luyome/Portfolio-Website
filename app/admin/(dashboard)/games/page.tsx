import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { games } from "@/db/schema";
import { deleteGame } from "@/lib/actions/games";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminGamesListPage() {
  const items = await db.select().from(games).orderBy(asc(games.sortOrder));

  return (
    <div>
      <div className="adm-title">Games</div>
      <p className="adm-sub">{items.length} item(s)</p>
      <Link href="/admin/games/new" className="adm-btn">+ New Game</Link>
      <table className="adm-table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.status}</td>
              <td className="adm-actions">
                <Link href={`/admin/games/${item.id}/edit`}>Edit</Link>
                <form action={deleteGame}>
                  <input type="hidden" name="id" value={item.id} />
                  <DeleteButton confirmText={`Delete "${item.title}"?`} />
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
