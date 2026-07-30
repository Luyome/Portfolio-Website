import Link from "next/link";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { sketches } from "@/db/schema";
import { deleteSketch } from "@/lib/actions/sketches";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminSketchesListPage() {
  const items = await db.select().from(sketches).orderBy(desc(sketches.year), asc(sketches.sortOrder));

  return (
    <div>
      <div className="adm-title">Sketches</div>
      <p className="adm-sub">{items.length} item(s)</p>
      <Link href="/admin/sketches/new" className="adm-btn">+ New Sketch</Link>
      <table className="adm-table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>Label</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.label}</td>
              <td>{item.year}</td>
              <td className="adm-actions">
                <Link href={`/admin/sketches/${item.id}/edit`}>Edit</Link>
                <form action={deleteSketch}>
                  <input type="hidden" name="id" value={item.id} />
                  <DeleteButton confirmText={`Delete "${item.label}"?`} />
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
