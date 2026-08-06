import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { worldMaps } from "@/db/schema";
import { deleteWorldMap } from "@/lib/actions/map";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default async function AdminMapsListPage() {
  const maps = await db.select().from(worldMaps).orderBy(asc(worldMaps.sortOrder), asc(worldMaps.id));
  const titleById = new Map(maps.map((m) => [m.id, m.title]));

  return (
    <div>
      <div className="adm-title">Map Manager</div>
      <p className="adm-sub">{maps.length} map(s)</p>
      <div className="adm-actions" style={{ marginBottom: 16 }}>
        <Link href="/admin/worldbuilding/maps/new" className="adm-btn">+ New Map</Link>
        <Link href="/admin/worldbuilding/map">Place Pins →</Link>
      </div>
      {maps.length === 0 ? (
        <AdminEmptyState label="No maps yet." />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <ResizableTh>Title</ResizableTh>
                <ResizableTh>Parent Map</ResizableTh>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maps.map((m) => (
                <tr key={m.id}>
                  <td>{m.title}</td>
                  <td>{m.parentMapId ? titleById.get(m.parentMapId) ?? "—" : "— (root map)"}</td>
                  <td>
                    <div className="adm-actions">
                      <Link href={`/admin/worldbuilding/maps/${m.id}/edit`}>Edit</Link>
                      <form action={deleteWorldMap}>
                        <input type="hidden" name="id" value={m.id} />
                        <DeleteButton confirmText={`Delete "${m.title}"? Pins on it will also be removed.`} />
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
