import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { deleteService } from "@/lib/actions/services";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminServicesListPage() {
  const items = await db.select().from(services).orderBy(asc(services.sortOrder), asc(services.id));

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description={`${items.length} item(s)`}
        action={<Link href="/admin/services/new" className="adm-btn">+ New Service</Link>}
      />
      {items.length === 0 ? (
        <AdminEmptyState label="No services yet." />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <ResizableTh>Icon</ResizableTh>
                <ResizableTh>Title</ResizableTh>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.icon}</td>
                  <td>{item.title}</td>
                  <td>
                    <div className="adm-actions">
                      <Link href={`/admin/services/${item.id}/edit`}>Edit</Link>
                      <form action={deleteService}>
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
