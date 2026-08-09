import Link from "next/link";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { models3d } from "@/db/schema";
import { deleteModel3D } from "@/lib/actions/models3d";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminModel3DListPage() {
  const items = await db.select().from(models3d).orderBy(desc(models3d.year), asc(models3d.sortOrder), asc(models3d.id));

  return (
    <div>
      <AdminPageHeader
        title="3D"
        description={`${items.length} item(s)`}
        action={<Link href="/admin/3d/new" className="adm-btn">+ New 3D Model</Link>}
      />
      {items.length === 0 ? (
        <AdminEmptyState label="No 3D models yet." />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <ResizableTh>Label</ResizableTh>
                <ResizableTh width={100}>Year</ResizableTh>
                <th className="adm-col-actions">Actions</th>
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
      )}
    </div>
  );
}
