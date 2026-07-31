import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { deleteService } from "@/lib/actions/services";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";

export default async function AdminServicesListPage() {
  const items = await db.select().from(services).orderBy(asc(services.sortOrder));

  return (
    <div>
      <div className="adm-title">Services</div>
      <p className="adm-sub">{items.length} item(s)</p>
      <Link href="/admin/services/new" className="adm-btn">+ New Service</Link>
      <table className="adm-table" style={{ marginTop: 24 }}>
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
  );
}
