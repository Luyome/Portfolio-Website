import Link from "next/link";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { sketches } from "@/db/schema";
import { deleteSketch } from "@/lib/actions/sketches";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminSketchesListPage() {
  const items = await db.select().from(sketches).orderBy(desc(sketches.year), asc(sketches.sortOrder), asc(sketches.id));

  return (
    <div>
      <AdminPageHeader
        title="Sketches"
        description={`${items.length} item(s)`}
        action={<Link href="/admin/sketches/new" className="adm-btn">+ New Sketch</Link>}
      />
      {items.length === 0 ? (
        <AdminEmptyState label="No sketches yet." />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <ResizableTh>Label</ResizableTh>
                <ResizableTh>Year</ResizableTh>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.label}</td>
                  <td>{item.year}</td>
                  <td>
                    <div className="adm-actions">
                      <Link href={`/admin/sketches/${item.id}/edit`}>Edit</Link>
                      <form action={deleteSketch}>
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteButton confirmText={`Delete "${item.label}"?`} />
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
