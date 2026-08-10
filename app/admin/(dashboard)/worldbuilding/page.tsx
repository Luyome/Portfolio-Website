import Link from "next/link";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { worldbuildingEntries } from "@/db/schema";
import { deleteWorldbuildingEntry } from "@/lib/actions/worldbuilding";
import { formatDisplayDate } from "@/lib/date-format";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminWorldbuildingListPage() {
  const items = await db
    .select()
    .from(worldbuildingEntries)
    .orderBy(desc(worldbuildingEntries.date), asc(worldbuildingEntries.sortOrder), asc(worldbuildingEntries.id));

  return (
    <div>
      <AdminPageHeader
        title="Worldbuilding"
        description={`${items.length} item(s)`}
        action={<Link href="/admin/worldbuilding/new" className="adm-btn">+ New Entry</Link>}
      />
      {items.length === 0 ? (
        <AdminEmptyState label="No worldbuilding entries yet." />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <ResizableTh>Title</ResizableTh>
                <ResizableTh width={150}>Category</ResizableTh>
                <ResizableTh width={120}>Date</ResizableTh>
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.cat}</td>
                  <td>{formatDisplayDate(item.date)}</td>
                  <td>
                    <div className="adm-actions">
                      <Link href={`/admin/worldbuilding/${item.id}/edit`}>Edit</Link>
                      <form action={deleteWorldbuildingEntry}>
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
