import Link from "next/link";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { models3d } from "@/db/schema";
import { deleteModel3D } from "@/lib/actions/models3d";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";

export default async function AdminModel3DListPage() {
  const items = await db.select().from(models3d).orderBy(desc(models3d.year), asc(models3d.sortOrder));

  return (
    <div>
      <div className="adm-title">3D</div>
      <p className="adm-sub">{items.length} item(s)</p>
      <Link href="/admin/3d/new" className="adm-btn">+ New 3D Model</Link>
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
                    <Link href={`/admin/3d/${item.id}/edit`}>Edit</Link>
                    <form action={deleteModel3D}>
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
    </div>
  );
}
