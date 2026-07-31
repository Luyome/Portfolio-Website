import Link from "next/link";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { worldbuildingEntries } from "@/db/schema";
import { deleteWorldbuildingEntry } from "@/lib/actions/worldbuilding";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";

export default async function AdminWorldbuildingListPage() {
  const items = await db
    .select()
    .from(worldbuildingEntries)
    .orderBy(desc(worldbuildingEntries.year), asc(worldbuildingEntries.sortOrder));

  return (
    <div>
      <div className="adm-title">Worldbuilding</div>
      <p className="adm-sub">{items.length} item(s)</p>
      <Link href="/admin/worldbuilding/new" className="adm-btn">+ New Entry</Link>
      <table className="adm-table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <ResizableTh>Title</ResizableTh>
            <ResizableTh>Category</ResizableTh>
            <ResizableTh>Year</ResizableTh>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.cat}</td>
              <td>{item.year}</td>
              <td className="adm-actions">
                <Link href={`/admin/worldbuilding/${item.id}/edit`}>Edit</Link>
                <form action={deleteWorldbuildingEntry}>
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
