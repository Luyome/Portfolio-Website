import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { games } from "@/db/schema";
import { deleteGame } from "@/lib/actions/games";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminGamesListPage() {
  const items = await db.select().from(games).orderBy(asc(games.sortOrder), asc(games.id));

  return (
    <div>
      <AdminPageHeader
        title="Games"
        description={`${items.length} item(s)`}
        action={<Link href="/admin/games/new" className="adm-btn">+ New Game</Link>}
      />
      {items.length === 0 ? (
        <AdminEmptyState label="No games yet." />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <ResizableTh>Title</ResizableTh>
                <ResizableTh width={130}>Status</ResizableTh>
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.status}</td>
                  <td>
                    <div className="adm-actions">
                      <Link href={`/admin/games/${item.id}/edit`}>Edit</Link>
                      <form action={deleteGame}>
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteButton confirmText={`Delete "${item.title}"?`} />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
